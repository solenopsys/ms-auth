import { Handler, HttpMethod } from "../types/handler";
import { DB } from "../db";
import { ClientService } from "../services/client.service";

const ROOT_SECRET=process.env.ROOT_SECRET!


export class RegisterHandler extends Handler {
	path = "/auth/register/root";
	method = HttpMethod.POST;

	constructor(
		private db: DB, 
	) {
		super();
	}

	async handle({ body }: any) {
		const { client_id, client_secret, root_secret,permissions} = body;

		// permissions [npm:add, npm:remove, npm:publish]

      console.log("RS",root_secret,ROOT_SECRET);

		if (root_secret !== ROOT_SECRET) {
			throw new Error("Invalid root secret");
		}

      const id= await this.db.createUser(client_id, client_secret);

      for (const permission of permissions) {
        const parsed = permission.split(':');
        if (parsed.length !== 2) {
          throw new Error('Invalid permission');
        }
       // await this.db.addPermissionToUserByAction(id, parsed.resource, parsed.action);
      } 

      return {
        id
      };
	}
}