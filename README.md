## Requirements

### Dependencies

``
npm install
``

### Min.io Server (NOT IN USE RIGHT NOW, using sftp with environment variable support right now)

minio is currently used as storage engine for the images API.

```
minio server minio/
```

this will use the ``minio`` directory. the admin login is default (``minioadmin`` / ``minioadmin``).


###### TODO
* [DONE] clearly seperate images between tenants and users
* what to do with the images in a category that is being deleted?
* permissions in general are not clear
* editing images for users is not possible, probably due to tenancies check.

#### 