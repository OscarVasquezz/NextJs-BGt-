//12.2
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';//12.6.0.1
import { redirect } from 'next/navigation';//12.6.0.2
import postgres from 'postgres'; //12.5

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });//12.5 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
}); 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {//const rawFormData = {//12.3.1
	const { customerId, amount, status } = CreateInvoice.parse({//12.4.2
	  customerId: formData.get('customerId'),//12.3.1
	  amount: formData.get('amount'),//12.3.1
	  status: formData.get('status'),//12.3.1
	}/*12.3.1*/);/*12.4.2*/
	// Test it out:
	//console.log(rawFormData);//12.3.1
	const amountInCents = amount * 100;//12.4.3
	const date = new Date().toISOString().split('T')[0];//12.4.4
	
	try {//13.1.1
		//in insesion a postgresql 12.5
		await sql`
		  INSERT INTO invoices (customer_id, amount, status, date)
		  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
		`;
		//fin insesion a postgresql 12.5		
	}catch(error){//13.1.1
		console.error(error);//13.1.1
		return{message: 'Database Error: Failed to Create Invoice.',};	//13.1.1	
	}//13.1.1
	
	revalidatePath('/dashboard/invoices');//12.6.0.1
	redirect('/dashboard/invoices');//12.6.0.2
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 try{//13.1.2
	await sql`
	  UPDATE invoices
	  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
	  WHERE id = ${id}
	`;
 }catch(error){//13.1.2
	console.error(error);//13.1.2
	return { message: 'Database Error: Failed to Update Invoice.' };//13.1.2
 }//13.1.2

 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');//13.1.3
	
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}


