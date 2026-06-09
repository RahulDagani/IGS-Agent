'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CommissionNoteRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/partner/commissionnote?id=${params.id}`);
  }, [params.id, router]);

  return null;
}
