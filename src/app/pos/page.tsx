
import React, { Suspense } from 'react';
import PosComponent from './pos-component';
import { Skeleton } from '@/components/ui/skeleton';

function PosPageSkeleton() {
    return (
        <div className="flex flex-col h-full bg-muted/40 p-4 gap-4">
            <div className="flex items-center gap-4 flex-wrap">
                <Skeleton className="h-10 flex-1 min-w-[300px]" />
                <Skeleton className="h-10 w-full sm:w-[200px]" />
                <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-40" />
                </div>
            </div>
            <div className="flex-1 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden p-4">
                 <Skeleton className="w-full h-full" />
            </div>
            <div className="p-4 border-t bg-background flex justify-end">
                <Skeleton className="h-8 w-48" />
            </div>
        </div>
    );
}

export default function PosPage() {
    return (
        <Suspense fallback={<PosPageSkeleton />}>
            <PosComponent />
        </Suspense>
    );
}
