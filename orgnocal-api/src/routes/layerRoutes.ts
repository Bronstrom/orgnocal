import { Router } from 'express'
import { createLayer, deleteLayer, getProjectLayers, updateLayer } from '../controllers/layerController'

const router = Router()

router.get('/', getProjectLayers)
router.post('/', createLayer)
router.patch('/:layerId', updateLayer)
router.delete('/:layerId', deleteLayer)

export default router
