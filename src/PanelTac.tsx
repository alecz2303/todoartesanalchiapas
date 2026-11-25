import './PanelTac.css';
import RobotAdmin from './RobotAdmin';
import TacOperations from './TacOperations';
import TacContacts from './TacContacts';
import type { Order } from './model';

type Module = 'operations' | 'conversations' | 'robot';
type Props = { module: Module; orders: Order[]; onOpenOrders: () => void; onOpenOrder: (order: Order) => void };

export default function PanelTac({ module, orders, onOpenOrders, onOpenOrder }: Props) {
 if (module === 'operations') return <TacOperations orders={orders} onOpenOrders={onOpenOrders} onOpenOrder={onOpenOrder}/>;
 if (module === 'conversations') return <TacContacts orders={orders} onOpenOrder={onOpenOrder}/>;
 return <RobotAdmin/>;
}
