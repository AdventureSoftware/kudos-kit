import Link from 'next/link';
import { Badge, Card, EmptyState, Pagination, SortableTh, Table, Td, Th, Tr, typeTone } from '@/components/ui';
import { cn } from '@/lib/cn';
import { feedbackHref, isFiltered, type FeedbackQuery, type SortField } from '@/lib/feedback-query';
import { DeleteButton, StatusButton } from './FeedbackActions';
import type { FeedbackListResponse } from './types';

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const firstDir: Record<SortField, 'asc' | 'desc'> = { created_at: 'desc', project: 'asc', type: 'asc', status: 'asc' };

interface FeedbackTableProps {
  data: FeedbackListResponse;
  query: FeedbackQuery;
}

export function FeedbackTable({ data, query }: FeedbackTableProps) {


  const sortHref = (field: SortField) =>
    feedbackHref(query, {
      sort: field,
      dir: query.sort === field ? (query.dir === 'asc' ? 'desc' : 'asc') : firstDir[field],
      page: 1,
      item: undefined,
    });
  const sortable = (field: SortField, label: string, className?: string) => (
    <SortableTh label={label} active={query.sort === field} dir={query.dir} href={sortHref(field)} className={className} />
  );

  if (data.rows.length === 0) {
    return (
      <Card>
        <EmptyState
          title={query.q ? `No results for “${query.q}”` : isFiltered(query) ? 'Nothing matches these filters' : 'No feedback yet'}
          hint={isFiltered(query) ? 'Try other words, another status or type, or clear the filters.' : 'Submissions from the widget will appear here.'}
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <thead>
          <tr>
            <Th className="w-24">Ref</Th>
            {sortable('project', 'Project')}
            {sortable('type', 'Type')}
            <Th className="w-full">Message</Th>
            {sortable('status', 'Status')}
            {sortable('created_at', 'Date', 'whitespace-nowrap')}
            <Th><span className="sr-only">Actions</span></Th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <Tr key={row.id} className={cn(row.id === query.item && 'bg-accent-soft/60')}>
              <Td className="whitespace-nowrap font-mono text-xs text-muted">{row.ref}</Td>
              <Td className="whitespace-nowrap">{row.project}</Td>
              <Td><Badge tone={typeTone[row.type] ?? 'neutral'}>{row.type}</Badge></Td>
              <Td className="max-w-0">
                <Link
                  href={feedbackHref(query, { item: row.id })}
                  scroll={false}
                  className="block truncate hover:text-accent hover:underline"
                  title="Open details"
                >
                  {row.message}
                </Link>
                {row.email && <p className="truncate text-xs text-muted">{row.email}</p>}
              </Td>
              <Td><StatusButton id={row.id} status={row.status} /></Td>
              <Td className="whitespace-nowrap text-muted">{dateFmt.format(new Date(row.created_at))}</Td>
              <Td className="text-right"><DeleteButton id={row.id} label={row.ref} /></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        pageSize={data.pageSize}
        hrefFor={(page) => feedbackHref(query, { page, item: undefined })}
      />
    </Card>
  );
}
