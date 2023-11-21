# here comes the bus api


An unoffical API & Client for [Here Comes The Bus](https://herecomesthebus.com/)

## ui
To enable the UI, you can just append `ENABLE_UI=true`

```
ENABLE_UI=true yarn start
```

## home assistant
Expiremental Home Assistant support has been added as of 2.1.0. Ensure you have a `config.js` with all of the fields filled out and a running hctb-api server and run `node hass.js`

## api

There is also an openapi.yaml file in the root directory.

POST `/api/login`

**Querystrings**

- user: Your HCTB email
- pass: Your HCTB password
- code: Your HCTB district code, it's usually a 5 digit code that is used by the district.

Example Response:
```json
{
    "success": true,
    "name": "David",
    "person": "7385b4fa-4563-4f02-97ea-0492e4619248",
    "time": "24b3a39b-8dc8-4cf5-a98c-d8ab9b05d544",
    "lat": "33.7488",
    "lon": "-84.3877",
    "cookie": ".ASPXFORMSAUTH=...",
    "times": [
        {
            "id": "00b19431-c745-42cd-bb43-c1fe83a19f0d",
            "selected": true,
            "time": "AM"
        },
        {
            "id": "487f4d75-8e59-442a-9da4-a59424aecf1f",
            "selected": false,
            "time": "MID"
        },
        {
            "id": "9e89abd0-781c-4a2a-875f-a794c029330d",
            "selected": false,
            "time": "PM"
        }
    ]
}
```

POST `/api/session`

**Querystrings**

- cookie: The cookie which you have gotten from /api/login
- person: The person UUID (from /api/login)
- time: The bus route time UUID (from /api/login)
- name: The person's name obtained from /api/loign

Example Response:
```json
{
    "success": true,
    "name": "David",
    "person": "7385b4fa-4563-4f02-97ea-0492e4619248",
    "time": "24b3a39b-8dc8-4cf5-a98c-d8ab9b05d544",
    "lat": "33.7488",
    "lon": "-84.3877",
    "cookie": ".ASPXFORMSAUTH=...",
    "times": [
        {
            "id": "00b19431-c745-42cd-bb43-c1fe83a19f0d",
            "selected": true,
            "time": "AM"
        },
        {
            "id": "487f4d75-8e59-442a-9da4-a59424aecf1f",
            "selected": false,
            "time": "MID"
        },
        {
            "id": "9e89abd0-781c-4a2a-875f-a794c029330d",
            "selected": false,
            "time": "PM"
        }
    ]
}
```

## hosting:
[heroku](https://heroku.com/deploy?template=https://github.com/aboutdavid/hctb-api) | [glitch](https://glitch.com/edit/#!/import/git?url=https://github.com/aboutdavid/hctb-api.git)
### self-hosting
```bash
yarn install
yarn start

# or

npm install
npm start
```
