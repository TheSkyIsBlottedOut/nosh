import * as Neo from 'neoclassical'
import { Logger } from 'logn'
import { O_O } from 'unhelpfully'
import { promisify } from 'util'
import { v4 as uuid } from 'uuid'


const pragma = O_O.fn.obj
pragma.O_O = O_O
pragma.fn = O_O.fn
pragma.Neo = Neo
pragma.up = Neo.evolve
pragma.uuid = uuid
pragma.promisify = promisify


export { pragma }