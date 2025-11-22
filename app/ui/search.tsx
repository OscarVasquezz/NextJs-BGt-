'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
//import { useSearchParams } from 'next/navigation';//11.2
import { useSearchParams, usePathname, useRouter } from 'next/navigation';//11.2.4
import { useDebouncedCallback } from 'use-debounce';//.4.2.3

export default function Search({ placeholder }: { placeholder: string }) {
	const searchParams = useSearchParams();//11.2
	const pathname = usePathname();//11.2.4
	const { replace } = useRouter();//11.2.4
	
	//function handleSearch(term: string) {//11/.1
		
	const handleSearch = useDebouncedCallback((term) => {//.4.2.3
		//console.log(`Searching... ${term}`);//11.4.2
		const params = new URLSearchParams(searchParams);//11.2.1	
		params.set('page', '1');//11.4.8
		if (term) {//11.2.3
		  params.set('query', term);//11.2.3
		} else {//11.2.3
		  params.delete('query');//11.2.3
		}//11.2.3
		replace(`${pathname}?${params.toString()}`);//11.2.4
	  //console.log(term);//11.1
	}/*11.1*/, 300);//.4.2.3
	
	
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
		onChange={(e) => {//11.1
		  handleSearch(e.target.value);//11.1
		}}//11.1
		defaultValue={searchParams.get('query')?.toString()}//11.3
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
