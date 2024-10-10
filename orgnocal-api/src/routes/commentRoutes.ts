import { Router } from 'express'
import { createComment, softDeleteComment } from '../controllers/commentController'

const router = Router()

router.post('/', createComment)
router.patch('/:commentId/soft-delete', softDeleteComment)

export default router
