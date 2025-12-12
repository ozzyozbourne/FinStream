import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionDetails {
    id: string;
    date: string;
    planName: string;
    amount: string;
    userEmail: string;
    userName: string;
}

export const generateReceipt = (details: TransactionDetails) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 212, 170); // FinStream Green
    doc.text('FinStream Finance', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Payment Receipt', 14, 30);

    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);

    // Transaction Info
    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text(`Transaction ID: ${details.id}`, 14, 45);
    doc.text(`Date: ${details.date}`, 14, 52);
    doc.text(`Billed To: ${details.userName} (${details.userEmail})`, 14, 59);

    // Table
    autoTable(doc, {
        startY: 70,
        head: [['Description', 'Amount']],
        body: [
            [`Subscription - ${details.planName} Plan`, details.amount],
        ],
        theme: 'grid',
        headStyles: {
            fillColor: [0, 212, 170],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 5
        }
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${details.amount}`, 160, finalY, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.text('FinStream Finance Inc.', 105, 285, { align: 'center' });

    // Save
    doc.save(`FinStream_Receipt_${details.date.replace(/\//g, '-')}.pdf`);
};
