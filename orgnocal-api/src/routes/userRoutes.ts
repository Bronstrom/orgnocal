import { Router } from 'express'
import { deleteUser, getUser, getUsers, updateUser } from '../controllers/userController'

const router = Router()

router.get('/', getUsers)
router.get('/:userId', getUser)
router.patch('/:userId', updateUser)
router.delete('/:userId', deleteUser)

export default router
