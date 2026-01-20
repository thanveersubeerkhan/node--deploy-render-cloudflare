import { Hono } from 'hono'
import { FileController } from '../controllers/fileController'
import { AppContext } from '../types'

const fileRoutes = new Hono<{ Bindings: any; Variables: any }>()

fileRoutes.post('/upload', (c) => FileController.upload(c as unknown as AppContext))
fileRoutes.get('/:id', (c) => FileController.getById(c as unknown as AppContext))

export default fileRoutes
