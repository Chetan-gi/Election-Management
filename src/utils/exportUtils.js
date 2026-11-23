/**
 * Universal CSV Export Utility
 */
export function exportContactsToCSV(contacts) {
  let csv = "ID,Full Legal Name,Father/Spouse Name,Mobile,Village/City,Polling Ward,Category,Date of Birth,Anniversary,Address,Notes\r\n";
  contacts.forEach(c => {
    csv += `"${c.id}","${c.fullName}","${c.fatherName || ''}","${c.mobile}","${c.village}","${c.ward}","${c.category}","${c.dob || ''}","${c.anniversary || ''}","${(c.address || '').replace(/"/g, '""')}","${(c.notes || '').replace(/"/g, '""')}"\r\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `voter_contacts_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
