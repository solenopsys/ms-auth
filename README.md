# ms-auth
SSO - Single Sign On for Solenopsys ecosystem
 


buildah bud -t ms-auth -f Dockerfile

 

podman run -d \
  -p 3000:3000 \
  -v ./sso:/db:Z \
   ms-auth:latest 