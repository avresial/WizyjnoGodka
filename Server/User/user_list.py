import json
from .user import User


class EncodeUser(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


class UserList:
    def __init__(self):
        self.list_of_users = []

    def append_new_user(self, sid: str) -> None:
        user = User(sid)
        self.list_of_users.append(user)

    def remove_user(self, sid: str) -> None:
        for user in self.list_of_users:
            if user.sid == sid:
                self.list_of_users.remove(user)
                break

    def get_user_list_in_json(self, sid) -> str:
        list_copy = []
        for user in self.list_of_users:
            if user.sid != sid:
                list_copy.append(user)
        str = json.dumps(list_copy, indent=4, cls=EncodeUser)
        return str

    def parse_user_to_json(self, user: User) -> str:
        str = json.dumps(user, indent=4, cls=EncodeUser)
        return str
