model
  schema 1.1
type group
  relations
    define assignee: [user]
type role
  relations
    define assignee: [user] or assignee from parent or assignee from parent_group
    define parent: [role]
    define parent_group: [group]
type user