class User:
    def __init__(self, sid_id):
        self.sid = sid_id
        self.name = ''

    def set_name(self, name):
        self.name = name

    def compare(self, sid):
        if self.sid == sid:
            return True
        else:
            return False
