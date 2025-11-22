import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
//import { fetchCustomers } from '@/app/lib/data';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';//13.1.5

export default async function Page(/*in...12.6.2.2*/ props: { params: Promise<{ id: string }> }/*fin...12.6.2.2*/) {
	
	const params = await props.params;//12.6.2.2
	const id = params.id;//12.6.2.2
	
	const [invoice, customers] = await Promise.all([//12.6.3.1
	  fetchInvoiceById(id),//12.6.3.1
	  fetchCustomers(),//12.6.3.1
	]);//12.6.3.1
	
	if (!invoice) {//13.1.5
	  notFound();//13.1.5
	}//13.1.5
	
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}