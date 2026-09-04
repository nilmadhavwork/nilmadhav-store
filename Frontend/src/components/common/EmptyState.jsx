import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction,
  actionLink,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">
        <Icon size={36} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && (
        onAction ? (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : actionLink ? (
          <a href={actionLink} className="btn btn-primary">
            {actionLabel}
          </a>
        ) : null
      )}
    </div>
  );
};

export default EmptyState;
