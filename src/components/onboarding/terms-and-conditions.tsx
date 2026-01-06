'use client';
import React from 'react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-md font-semibold mt-4 mb-2 text-foreground">{children}</h3>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground mb-2">{children}</p>
);

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="text-sm text-muted-foreground ml-4 list-disc">{children}</li>
);

export default function TermsAndConditions() {
  return (
    <div className="text-sm">
      <h2 className="text-lg font-bold mb-4 text-foreground">Terms and Conditions & Client Protection Principles</h2>
      
      <SectionTitle>THE ACCOUNT</SectionTitle>
      <Paragraph>
        The Customer shall assume full responsibility for the genuineness, correctness and validity of all endorsements appearing on all cheques, orders, bills, notes, negotiable instruments, receipts or other instructions deposited into the account. InnBucks will not be responsible for any loss of funds deposited with it arising from any future Government order, law, levy, tax, embargo, moratorium, exchange restriction or any other cause beyond its control. Your account shall be debited for any service charge that is set by InnBucks from time to time. All notices or letters will be sent to the physical, postal or electronic address supplied by you and will be considered duly delivered and received at that time it is delivered or seven days after posting.
      </Paragraph>
      <Paragraph>
        InnBucks will not be liable for funds handed over to members of its staff other than the Tellers in the InnBucks premises with the appropriate deposit slip. Any anomaly In the entries on your Bank statements must be brought to the attention of InnBucks within 30 days of the date thereof and you agree that the failure to give such notice absolves InnBucks from all liabilities arising thereof.
      </Paragraph>
      <Paragraph>
        InnBucks may exercise its general lien or any similar right it is entitled to including the right to combine and consolidate all or any of the Customer’s accounts with InnBucks, and the right to set off or transfer any sum or sums standing to the credit of any one or more of such accounts against liabilities in any other account.
      </Paragraph>

      <SectionTitle>DISCLOSURE</SectionTitle>
      <Paragraph>
        The applicant agrees and authorise InnBucks or the approved credit reference bureau to: a) make enquiries from any bank, financial institution or approved credit reference bureau in Zimbabwe to confirm any information provided by the applicant. b) Seek information from any bank, financial institution or approved credit reference bureau when assessing the customer at any time during the existence of the applicant’s account c) Disclose to financial clearing bureau an approved credit reference bureau, information relating to the applicant’s account maintained at InnBucks.
      </Paragraph>

      <SectionTitle>INSTRUCTIONS</SectionTitle>
      <Paragraph>
        InnBucks may rely on the authority of each person designated (in a form acceptable to InnBucks by the Customer to send instructions or do any other thing until InnBucks has received written notice or other notice acceptable to it of any change from a duly authorized person and InnBucks has had a reasonable time to act (after which time it may rely on the change).
      </Paragraph>

      <SectionTitle>CLIENT PROTECTION PRINCIPLES</SectionTitle>
      <Paragraph>
        InnBucks MicroBank Limited is committed to the following Client Protection Principles:
      </Paragraph>
      <ul>
        <ListItem>
          <strong>Appropriate product design and delivery:</strong> We take adequate care to design products and delivery channels in such a way that they do not cause clients harm.
        </ListItem>
        <ListItem>
          <strong>Prevention of over-indebtedness:</strong> We take adequate care in all phases of the credit process to determine that clients have the capacity to repay without becoming over-indebted.
        </ListItem>
        <ListItem>
          <strong>Transparency:</strong> We communicate clear, sufficient and timely information in a manner and language clients can understand so that clients can make informed decisions.
        </ListItem>
        <ListItem>
          <strong>Responsible pricing:</strong> Pricing, terms and conditions will be set in a way that is affordable to clients while allowing for financial institutions to be sustainable.
        </ListItem>
        <ListItem>
          <strong>Fair and respectful treatment of clients:</strong> Our staff and agents treat the clients fairly and respectfully. They will not discriminate.
        </ListItem>
        <ListItem>
          <strong>Privacy of client data:</strong> The privacy of individual client data is respected in accordance with the laws and regulations. Such data is only used for the purposes specified at the time the information is collected or as permitted by law.
        </ListItem>
        <ListItem>
          <strong>Mechanisms for complaint resolution:</strong> We have in place timely and responsive mechanisms for complaints and problem resolution for their clients.
        </ListItem>
      </ul>

      <SectionTitle>TERMINATION</SectionTitle>
      <Paragraph>
        Either party may terminate this agreement at any time (but subject to any legal requirements as to notice) by notifying the other in writing. On closure of an account, the termination becomes effective after any cheque drawn on the account or outstanding on it have been paid; all debit cards and internet banking tokens issued to you have been sent back to InnBucks; and all information and equipment supplied by InnBucks have been returned to InnBucks.
      </Paragraph>
    </div>
  );
}
