import { Router } from 'express'
import { createOrg, deleteOrg, getOrg, getOrgs, updateOrg } from '../controllers/orgController'

const router = Router()

router.get('/', getOrgs)
router.get('/:orgId', getOrg)
router.post('/', createOrg)
router.patch('/:orgId', updateOrg)
router.delete('/:orgId', deleteOrg)

export default router
