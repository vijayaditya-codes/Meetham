import { Request, Response } from 'express';
import { BadRequestError } from '../../utils/errors';

export async function uploadImage(req: Request, res: Response) {
  // Placeholder: integrate Cloudinary/S3 in production
  const { imageUrl } = req.body as { imageUrl?: string };
  if (!imageUrl) {
    throw new BadRequestError('imageUrl is required (direct URL upload placeholder)');
  }
  res.json({ success: true, data: { url: imageUrl } });
}
