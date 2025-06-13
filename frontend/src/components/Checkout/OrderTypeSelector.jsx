import React from 'react';

const OrderTypeSelector = ({
    orderType,
    setOrderType,
    orderTypeConfirmed,
    setOrderTypeConfirmed,
    storeName,
    storeAddress,
    colorAccent,
    colorMuted
}) => (
    <div className="bg-white rounded shadow p-4 mb-4">
        {!orderTypeConfirmed ? (
            <>
                <div className="mb-2 flex items-center">
                    <span className="mr-2">
                        <svg width="20" height="20" fill={colorAccent} viewBox="0 0 20 20">
                            <path d="M7.629 15.314l-4.95-4.95 1.414-1.414 3.536 3.535 7.072-7.071 1.414 1.414z"/>
                        </svg>
                    </span>
                    <span>
                        {orderType === 'pickup'
                            ? <>You're <b>picking up</b> your order from <b>{storeName}</b>, {storeAddress}</>
                            : <>We'll <b>send it</b> from <b>{storeName}</b></>
                        }
                    </span>
                </div>
                <div className="mt-4">
                    <div
                        className="text-[var(--color-accent)] font-semibold mb-2"
                        style={{ color: colorAccent }}
                    >
                        How would you like to get your order?
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            className={`flex items-center border rounded-lg px-4 py-3 text-left transition ${
                                orderType === 'pickup'
                                    ? 'border-[var(--color-accent)] bg-[var(--color-muted)] shadow'
                                    : 'border-gray-300 bg-gray-50'
                            }`}
                            style={{
                                borderColor: orderType === 'pickup' ? colorAccent : '#ccc',
                                background: orderType === 'pickup' ? colorMuted : '#f9f9f9'
                            }}
                            onClick={() => {
                                setOrderType('pickup');
                                setOrderTypeConfirmed(true);
                            }}
                        >
                            <span className="mr-3">
                                <input
                                    type="radio"
                                    checked={orderType === 'pickup'}
                                    onChange={() => {
                                        setOrderType('pickup');
                                        setOrderTypeConfirmed(true);
                                    }}
                                    className="accent-[var(--color-accent)]"
                                    style={{ accentColor: colorAccent }}
                                />
                            </span>
                            <span>
                                <b>I'll pick it up from {storeName}</b>
                                <div className="text-xs text-gray-500">{storeAddress}</div>
                            </span>
                        </button>
                        <button
                            className={`flex items-center border rounded-lg px-4 py-3 text-left transition ${
                                orderType === 'delivery'
                                    ? 'border-[var(--color-accent)] bg-[var(--color-muted)] shadow'
                                    : 'border-gray-300 bg-gray-50'
                            }`}
                            style={{
                                borderColor: orderType === 'delivery' ? colorAccent : '#ccc',
                                background: orderType === 'delivery' ? colorMuted : '#f9f9f9'
                            }}
                            onClick={() => {
                                setOrderType('delivery');
                                setOrderTypeConfirmed(true);
                            }}
                        >
                            <span className="mr-3">
                                <input
                                    type="radio"
                                    checked={orderType === 'delivery'}
                                    onChange={() => {
                                        setOrderType('delivery');
                                        setOrderTypeConfirmed(true);
                                    }}
                                    className="accent-[var(--color-accent)]"
                                    style={{ accentColor: colorAccent }}
                                />
                            </span>
                            <span>
                                <b>Deliver it from {storeName}</b>
                                <div className="text-xs text-gray-500">{storeAddress}</div>
                            </span>
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex justify-between items-center">
                <div>
                    {orderType === 'pickup'
                        ? <>Pickup from <b>{storeName}</b>, {storeAddress}</>
                        : <>Delivery from <b>{storeName}</b>, {storeAddress}</>
                    }
                </div>
                <button
                    className="text-blue-600 underline ml-4"
                    onClick={() => setOrderTypeConfirmed(false)}
                >
                    Edit
                </button>
            </div>
        )}
    </div>
);

export default OrderTypeSelector;