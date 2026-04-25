
export const NotificationCard = ({ title, message, time }) => (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4 w-full md:w-2/3 lg:w-1/2 mx-auto">
        <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <span className="text-sm text-gray-500">{time}</span>
        </div>
        <p className="text-gray-600 mt-2">{message}</p>
    </div>
);
