import React from 'react';
import { useReferenceList } from '../contexts/ReferenceListContext';
import Reference from './Reference';
import { useSearchBar } from '../contexts/SearchBarContext';

function ReferenceLister() {
  const { searchBar } = useSearchBar();
  const { referenceList } = useReferenceList();

  return (
    <div className="referenceBottles">
      { referenceList && referenceList.filter((reference) => (Object.values(reference)
        .join().toUpperCase()
        .includes(searchBar.toUpperCase())
      )).map((reference) => (
        <Reference key={reference.id} reference={reference} />
      ))}
    </div>
  );
}

export default ReferenceLister;
