import { Router } from 'express'
import { createUser, deleteUser, getCognitoUser, getUser, getUsers, updateUser } from '../controllers/userController'

const router = Router()

router.get('/', getUsers)
router.get("/:cognitoId/cognito-user", getCognitoUser)
router.get('/:userId', getUser)
router.post("/", createUser)
router.patch('/:userId', updateUser)
router.delete('/:userId', deleteUser)

export default router
