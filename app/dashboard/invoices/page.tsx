import Pagination from '@/app/ui/invoices/pagination';//in... capitulo 11 Código de inicio 
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';//11.4.4
 
export default async function Page(/*in...11.4*/props: {
  searchParams?: Promise<{//11.4
    query?: string;//11.4
    page?: string;//11.4
  }>;//11.4
}/*11.4*/) {
	
	const searchParams = await props.searchParams;//11.4
	const query = searchParams?.query || '';//11.4
	const currentPage = Number(searchParams?.page) || 1;//fin... 11.4
	const totalPages = await fetchInvoicesPages(query);//11.4.4
	
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      {/*descomentando 11.4*/<Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense> /*fin descomentado 11.4*/}
      <div className="mt-5 flex w-full justify-center">
        {/*descomentando 11.4.5*/ <Pagination totalPages={totalPages} /> /*descomentando 11.4.5*/}
      </div>
    </div>
  );
}//fi... capitulo 11 Código de inicio 