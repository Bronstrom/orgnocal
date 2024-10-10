import { Router } from 'express'
import { createTask, getTasks, getTask, getUserTasks, updateTask, updateTaskParent, updateTaskLayer, updateTaskStatus, deleteTask } from '../controllers/taskController'

const router = Router()

router.get('/', getTasks)
router.get('/:taskId', getTask)
router.get('/user/:userId', getUserTasks)
router.post('/', createTask)
router.patch('/:taskId', updateTask)
router.patch('/:taskId/layer', updateTaskLayer)
router.patch('/:taskId/status', updateTaskStatus)
// TODO: Is this used anywhere?
router.put('/:taskId/parent', updateTaskParent)
router.delete('/:taskId', deleteTask)

export default router
