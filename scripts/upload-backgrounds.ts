import { config } from 'dotenv';
import { resolve } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import sharp from 'sharp';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  originalPath: string;
  filename: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  category: string;
}

interface CategoryUploadResults {
  [category: string]: UploadResult[];
}

async function uploadImage(
  filePath: string,
  filename: string,
  category: string
): Promise<UploadResult> {
  // Create public ID with category folder structure: backgrounds/{category}/{filename}
  const publicId = filename.replace(/\.[^.]+$/, '');
  const fullPublicId = `backgrounds/${category}/${publicId}`;

  console.log(`Uploading ${category}/${filename}...`);

  try {
    // Check file size first
    const stats = await stat(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    const MAX_SIZE_MB = 10;
    const COMPRESS_THRESHOLD_MB = 5; // Compress images larger than 5MB

    // Determine if we should compress based on size and format
    const isPng = filename.toLowerCase().endsWith('.png');
    const isLarge = fileSizeMB > COMPRESS_THRESHOLD_MB;
    const shouldCompress = isLarge || isPng; // Always compress PNGs for better size

    if (shouldCompress) {
      const compressionReason = isLarge 
        ? `exceeds ${COMPRESS_THRESHOLD_MB}MB threshold (${fileSizeMB.toFixed(2)}MB)`
        : 'PNG format (optimizing size)';
      
      console.log(`🗜️  Compressing ${filename} - ${compressionReason}...`);

      try {
        // Get image metadata to preserve quality appropriately
        const metadata = await sharp(filePath).metadata();
        const isTransparent = metadata.hasAlpha;

        let compressedBuffer: Buffer;

        if (isPng && isTransparent) {
          // For PNG with transparency, convert to WebP with transparency support
          compressedBuffer = await sharp(filePath)
            .webp({ quality: 90, effort: 6 })
            .toBuffer();
        } else if (isPng && !isTransparent) {
          // For PNG without transparency, convert to JPEG for better compression
          compressedBuffer = await sharp(filePath)
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();
        } else {
          // For other formats, optimize with WebP
          compressedBuffer = await sharp(filePath)
            .webp({ quality: 85, effort: 6 })
            .toBuffer();
        }

        const compressedSizeMB = compressedBuffer.length / (1024 * 1024);
        const compressionRatio = ((1 - compressedBuffer.length / stats.size) * 100).toFixed(1);
        console.log(`   ✅ Compressed to ${compressedSizeMB.toFixed(2)}MB (${compressionRatio}% reduction)`);

        // Upload from buffer using upload_stream
        const uploadResult =
          await new Promise<Awaited<ReturnType<typeof cloudinary.uploader.upload>>>(
            (resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  public_id: fullPublicId,
                  folder: 'backgrounds',
                  overwrite: true,
                  resource_type: 'image',
                  transformation: [
                    {
                      quality: 'auto',
                      fetch_format: 'auto',
                    },
                  ],
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result!);
                }
              );

              uploadStream.end(compressedBuffer);
            }
          );

        return {
          originalPath: `/${category}/${filename}`,
          filename,
          publicId: uploadResult.public_id,
          secureUrl: uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          category,
        };
      } catch (compressError) {
        console.log(`   ⚠️  Compression failed, uploading original: ${compressError instanceof Error ? compressError.message : 'Unknown error'}`);
        // Fall through to upload original
      }
    }

    // Upload normally if file is within size limit or compression failed
    if (fileSizeMB > MAX_SIZE_MB) {
      throw new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size (${MAX_SIZE_MB}MB) even after compression attempts`);
    }

    const result = await cloudinary.uploader.upload(filePath, {
      public_id: fullPublicId,
      folder: 'backgrounds',
      overwrite: true,
      resource_type: 'image',
      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });

    return {
      originalPath: `/${category}/${filename}`,
      filename,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      category,
    };
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
    throw error;
  }
}

async function uploadCategory(category: string): Promise<UploadResult[]> {
  const categoryDir = join(process.cwd(), 'public', category);

  try {
    // Get all image files from the category directory
    const files = await readdir(categoryDir);
    const imageFiles = files.filter(
      (file) =>
        file.toLowerCase().endsWith('.jpg') ||
        file.toLowerCase().endsWith('.jpeg') ||
        file.toLowerCase().endsWith('.png') ||
        file.toLowerCase().endsWith('.webp') ||
        file.toLowerCase().endsWith('.avif')
    );

    if (imageFiles.length === 0) {
      console.log(`No image files found in public/${category}/`);
      return [];
    }

    console.log(`\n📁 Category: ${category.toUpperCase()} (${imageFiles.length} images)`);
    console.log('─'.repeat(50));

    const results: UploadResult[] = [];
    const errors: Array<{ filename: string; error: string }> = [];

    // Upload each image
    for (const filename of imageFiles) {
      try {
        const filePath = join(categoryDir, filename);
        const result = await uploadImage(filePath, filename, category);
        results.push(result);
        console.log(`✅ Uploaded: ${filename} -> ${result.publicId}`);
      } catch (error) {
        errors.push({
          filename,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`❌ Failed: ${filename}`);
      }
    }

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors in ${category}:`);
      errors.forEach(({ filename, error }) => {
        const errorMsg = error.includes('File size too large')
          ? `File too large (max 10MB) - consider compressing or upgrading Cloudinary plan`
          : error;
        console.log(`  - ${filename}: ${errorMsg}`);
      });
    }

    return results;
  } catch (error) {
    // Directory doesn't exist or can't be read
    console.log(`⚠️  Skipping category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}

async function main() {
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set in environment variables'
    );
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error('CLOUDINARY_API_KEY is not set in environment variables');
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      'CLOUDINARY_API_SECRET is not set in environment variables'
    );
  }

  // Define categories to upload
  const categories = ['mac', 'nature', 'radiant', 'mesh', 'demo', 'assets', 'silk'];

  console.log('🚀 Starting Cloudinary Upload');
  console.log('═'.repeat(50));

  const categoryResults: CategoryUploadResults = {};
  const allResults: UploadResult[] = [];
  const allErrors: Array<{ category: string; filename: string; error: string }> =
    [];

  // Upload each category
  for (const category of categories) {
    const results = await uploadCategory(category);
    if (results.length > 0) {
      categoryResults[category] = results;
      allResults.push(...results);
    }
  }

  if (allResults.length === 0) {
    console.error('\n❌ No images were uploaded! Please check your Cloudinary credentials and try again.');
    process.exit(1);
  }

  // Create mapping object grouped by category
  const categoryMapping: Record<string, string[]> = {};
  const allPublicIds: string[] = [];

  Object.keys(categoryResults).forEach((category) => {
    categoryMapping[category] = categoryResults[category].map((r) => r.publicId);
    allPublicIds.push(...categoryMapping[category]);
  });

  // Find suitable backgrounds for sign-in/sign-up pages (prefer mac category)
  const macResults = categoryResults['mac'] || [];
  const signInPublicId =
    macResults.find((r) => r.filename.includes('mac-asset-7'))?.publicId ||
    macResults.find((r) => r.filename.includes('mac-asset-1'))?.publicId ||
    macResults[0]?.publicId ||
    allResults[0]?.publicId ||
    'backgrounds/mac/mac-asset-1';

  const signUpPublicId =
    macResults.find((r) => r.filename.includes('mac-asset-2'))?.publicId ||
    macResults.find((r) => r.filename.includes('mac-asset-3'))?.publicId ||
    macResults.find(
      (r) => !r.publicId.includes(signInPublicId.replace('backgrounds/', ''))
    )?.publicId ||
    signInPublicId;

  // Generate TypeScript file content
  const mappingContent = `// This file is auto-generated by scripts/upload-backgrounds.ts
// DO NOT EDIT MANUALLY

export interface BackgroundCategory {
  [category: string]: string[];
}

export const backgroundCategories: BackgroundCategory = ${JSON.stringify(categoryMapping, null, 2)};

export const cloudinaryPublicIds: string[] = ${JSON.stringify(allPublicIds, null, 2)};

// Public ID for sign-in page background
export const SIGN_IN_BACKGROUND_PUBLIC_ID = '${signInPublicId}';

// Public ID for sign-up page background
export const SIGN_UP_BACKGROUND_PUBLIC_ID = '${signUpPublicId}';

// Helper function to get all public IDs for a category
export function getBackgroundsByCategory(category: string): string[] {
  return backgroundCategories[category] || [];
}

// Helper function to get all available categories
export function getAvailableCategories(): string[] {
  return Object.keys(backgroundCategories);
}
`;

  await writeFile(
    join(process.cwd(), 'lib', 'cloudinary-backgrounds.ts'),
    mappingContent,
    'utf-8'
  );

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Upload Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Successfully uploaded: ${allResults.length} images`);
  console.log(`❌ Failed: ${allErrors.length}`);

  Object.keys(categoryResults).forEach((category) => {
    const count = categoryResults[category].length;
    console.log(`   📁 ${category}: ${count} images`);
  });

  console.log('\n✅ Mapping file created at: lib/cloudinary-backgrounds.ts');
  console.log('✅ All components are now using Cloudinary public IDs organized by category!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});