import { Hono } from 'hono'
import { ItemController } from '../controllers/itemController'
import { AppContext } from '../types'

const itemRoutes = new Hono<{ Bindings: any; Variables: any }>()

itemRoutes.get('/', (c) => ItemController.getAll(c as unknown as AppContext))
itemRoutes.get('/:id', (c) => ItemController.getById(c as unknown as AppContext))
itemRoutes.post('/', (c) => ItemController.create(c as unknown as AppContext))
itemRoutes.put('/:id', (c) => ItemController.update(c as unknown as AppContext))
itemRoutes.delete('/:id', (c) => ItemController.delete(c as unknown as AppContext))

export default itemRoutes
