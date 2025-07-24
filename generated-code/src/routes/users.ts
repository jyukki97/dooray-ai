import express from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';
import { validateUser } from '../middleware/validation';

const router = express.Router();
const userController = new UserController();

// 사용자 생성
router.post('/', 
  authMiddleware, 
  validateUser, 
  userController.createUser.bind(userController)
);

// 사용자 조회
router.get('/:id', 
  authMiddleware, 
  userController.getUserById.bind(userController)
);

// 사용자 목록 조회
router.get('/', 
  authMiddleware, 
  userController.getUsers.bind(userController)
);

// 사용자 정보 수정
router.put('/:id', 
  authMiddleware, 
  validateUser, 
  userController.updateUser.bind(userController)
);

// 사용자 삭제
router.delete('/:id', 
  authMiddleware, 
  userController.deleteUser.bind(userController)
);

export default router;