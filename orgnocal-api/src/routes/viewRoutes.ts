import { Router } from 'express'
import { updateView, deleteView, createView } from '../controllers/viewController'

const router = Router()

router.post('/', createView)
router.patch('/:viewId', updateView)
router.delete('/:viewId', deleteView)

export default router
