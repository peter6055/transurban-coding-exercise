## API Documentation
### Endpoints

| Method | URL               | Description                                                               |
|--------|-------------------|---------------------------------------------------------------------------|
| `POST` | `/address/find`   | Find address using user ID, and an optional filter of Suburb and Postcode |
| `POST` | `/address/create` | Create address under a specific user                                      |

Detail: https://documenter.getpostman.com/view/30661295/2sAXqs7NAg

### Response Status Code

| Code  | Title                   | Description                                                                            |
|-------|-------------------------|----------------------------------------------------------------------------------------|
| `200` | `OK`                    | When a request was successfully processed                                              |
| `201` | `Created`               | Every time a record has been added to the database                                     |
| `400` | `Bad request`           | When the request could not be understood (e.g. invalid syntax).                        |
| `401` | `Unauthorized`          | When authentication failed. (no key/key invalid)                                       |
| `403` | `Forbidden`             | When an authenticated user is trying to perform an action does not have permission to. |
| `404` | `Not found`             | When URL or entity is not found.                                                       |
| `500` | `Internal server error` | When an internal error has happened                                                    |

Notes: Inspired by https://github.com/ml-archive/readme/blob/master/Documentation/how-to-write-apis.md?plain=1