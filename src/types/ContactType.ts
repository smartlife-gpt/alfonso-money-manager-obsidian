export interface ContactType {
  contactId: string;
  name: {
    display: string;
    given: string;
    family: string;
  };
}
