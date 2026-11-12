import Link from 'next/link';
import { Badge, Card, EmptyState, Pagination, SortableTh, Stars, Table, Td, Th, Tr, typeTone, LocalTime } from '@/components/ui';
import { cn } from '@/lib/cn';
import { feedbackHref, isFiltered, type FeedbackQuery, type SortField } from '@/lib/feedback-query';
import { DeleteButton, StatusButton } from './FeedbackActions';
import type { FeedbackListResponse } from './types';


const firstDir: Record<SortField, 'asc' | 'desc'> = { created_at: 'desc', project: 'asc', type: 'asc', status: 'asc' };

interface FeedbackTableProps {
  data: FeedbackListResponse;
  query: FeedbackQuery;
  canDelete: boolean;
}

export function FeedbackTable({ data, query, canDelete }: FeedbackTableProps) {


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
              <Td>
                <Badge tone={typeTone[row.type] ?? 'neutral'}>{row.type}</Badge>
              </Td>
              <Td className="max-w-0">
                <Link
                  href={feedbackHref(query, { item: row.id })}
                  scroll={false}
                  className="block truncate hover:text-accent hover:underline"
                  title="Open details"
                >
                  {row.message}
                </Link>
                <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 overflow-hidden text-xs text-muted">
                  {row.rating && <Stars value={row.rating} />}
                  {row.testimonial_ok && (
                    <span className="whitespace-nowrap font-medium text-success" title="The sender agreed this may be shown publicly">
                      ★ Testimonial<span className="hidden xl:inline"> OK</span>
                    </span>
                  )}
                  {row.email && <span className="min-w-0 max-w-full truncate">{row.email}</span>}
                </p>
              </Td>
              <Td><StatusButton id={row.id} status={row.status} /></Td>
              <Td className="whitespace-nowrap text-muted"><LocalTime value={row.created_at} /></Td>
              <Td className="text-right">{canDelete && <DeleteButton id={row.id} label={row.ref} />}</Td>
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
