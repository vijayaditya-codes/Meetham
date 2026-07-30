import { Router } from 'express';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Route: POST /api/v1/uploads/image
router.post('/image', authenticate, (req, res) => {
  const mockImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=500',
  ];
  
  const url = mockImages[Math.floor(Math.random() * mockImages.length)];
  
  res.status(200).json({
    status: 'success',
    data: {
      url,
      message: 'Mock upload successful. Standard fallback Unsplash image returned.',
    },
  });
});

export default router;
