model
  schema 1.1
type client
type group
  relations
    define assignee: [user, client]
type role
  relations
    define assignee: [user, client] or assignee from parent or assignee from parent_group
    define parent: [role]
    define parent_group: [group]
type user
