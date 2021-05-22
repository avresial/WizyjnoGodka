from Invitation.invitation import Invitation


class InvitationList:
    def __init__(self):
        self.list_of_invitations = []

    def append(self, sender_sid: str, receiver_sid: str) -> None:
        new_invitation = Invitation(sender_sid, receiver_sid)
        self.list_of_invitations.append(new_invitation)

    def remove(self, sender_sid: str, receiver_sid: str) -> None:
        for invitation in self.list_of_invitations:
            if invitation.sender_sid == sender_sid and invitation.receiver_sid == receiver_sid:
                self.list_of_invitations.remove(invitation)
                break

    def invitation_exist(self, sender_sid: str,receiver_sid: str) -> bool:
        for invitation in self.list_of_invitations:
            if invitation.sender_sid == sender_sid and invitation.receiver_sid == receiver_sid:
                return True
        return False

    def count_same_invitations(self,sender_sid: str,receiver_sid: str) -> int:
        #prevents DDOS memory overflow hehehehe
        counter = 0
        for invitation in self.list_of_invitations:
            if invitation.sender_sid == sender_sid and invitation.receiver_sid == receiver_sid:
                counter += 1
        return counter
