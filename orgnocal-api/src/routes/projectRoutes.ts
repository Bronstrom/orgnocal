import { Router } from 'express'
import { createProject, deleteProject, getProject, getProjects, updateProject, updateProjectLayers, updateProjectUsers } from '../controllers/projectController'

const router = Router()

router.get('/', getProjects)
router.get('/:projectId', getProject)
router.post('/', createProject)
router.patch('/:projectId', updateProject)
router.patch('/:projectId/layers', updateProjectLayers)
router.patch('/:projectId/update-users', updateProjectUsers)
router.delete('/:projectId', deleteProject)

export default router
