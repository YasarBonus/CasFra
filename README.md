## Requirements

### Dependencies

``
npm install
``

### Min.io Server

minio is currently used as storage engine for the images API.

```
minio server minio/
```

this will use the ``minio`` directory. the admin login is default (``minioadmin`` / ``minioadmin``).


## Starting on 09.01.2023 I'm testing some functionality to not touch it afterwards for some time. This is the list of things checked.

#### Images

###### Image Categories

* have a name and description
* assigned to tenant
* add, duplicate and delete categories

###### Images

* have a name and categorie
* upload and delete images

###### TODO
* [DONE] clearly seperate images between tenants and users
* what to do with the images in a category that is being deleted?
* permissions in general are not clear
* editing images for users is not possible, probably due to tenancies check.

#### 