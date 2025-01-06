# ms-auth
SSO - Single Sign On for Solenopsys ecosystem
 


buildah bud -t ms-auth -f Dockerfile

 

podman run -d \
  -p 3005:3000 \
  -v ./sso:/db:Z \
   ms-auth:latest 


podman run -d   -p 3005:3000   -v ./sso:/db:Z --env-file .env   ms-auth:latest    


podman run -d \
  -p 3005:3000 \
  -v /var/home/core/sso:/db:Z \
  -e ROOT_SECRET=blalba \
  -e JWT_SECRET=your-jwt-secret
  --name ms-auth 
  --network my-network
  localhost/ms-auth

