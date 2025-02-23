import React, { useState, useEffect } from "react";

// Define the Booking interface
interface Booking {
  id: number;
  name: string;
  email: string;
}

// Get the event slots from the environment variable
const EVENT_SLOTS = Number(import.meta.env.VITE_EVENT_SLOTS) || 10;

// Define the useBookingState hook
const useBookingState = () => {
  const [bookings, setBookings] = useState<Booking[]>(
    JSON.parse(localStorage.getItem("bookings") || "[]")
  );
  const [waitingList, setWaitingList] = useState<Booking[]>(
    JSON.parse(localStorage.getItem("waitingList") || "[]")
  );
  const [availableSlots, setAvailableSlots] = useState(
    Number(localStorage.getItem("availableSlots")) || EVENT_SLOTS
  );

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
    localStorage.setItem("waitingList", JSON.stringify(waitingList));
    localStorage.setItem("availableSlots", String(availableSlots));
  }, [bookings, waitingList, availableSlots]);

  // Functions to book, cancel, and reset bookings
  const bookSlot = (name: string, email: string) => {
    if (!name.trim() || !email.trim()) {
      alert("Please enter both name and email.");
      return;
    }

    if (bookings.some((b) => b.email === email) || waitingList.some((w) => w.email === email)) {
      alert("This email is already used for booking or waiting list.");
      return;
    }

    // Create a new booking
    const newBooking: Booking = { id: Date.now(), name, email };

    // Check if there are available slots
    if (availableSlots > 0) {
      setBookings([...bookings, newBooking]);
      setAvailableSlots(availableSlots - 1);
    } else {
      setWaitingList([...waitingList, newBooking]);
    }
  };

  // Function to cancel a booking
  const cancelBooking = (id: number) => {
    const updatedBookings = bookings.filter((b) => b.id !== id);
    setBookings(updatedBookings);
    
    if (waitingList.length > 0) {
      const [nextInLine, ...remainingWaiting] = waitingList;
      setBookings([...updatedBookings, nextInLine]);
      setWaitingList(remainingWaiting);
    } else {
      setAvailableSlots(availableSlots + 1);
    }
  };

  // Function to reset bookings
  const resetBookings = () => {
    setBookings([]);
    setWaitingList([]);
    setAvailableSlots(EVENT_SLOTS);
    localStorage.removeItem("bookings");
    localStorage.removeItem("waitingList");
    localStorage.removeItem("availableSlots");
  };

  // Return the state and functions
  return { bookings, waitingList, availableSlots, bookSlot, cancelBooking, resetBookings };
};

// Define the EventBooking component 
const EventBooking: React.FC = () => {
  const { bookings, waitingList, availableSlots, bookSlot, cancelBooking, resetBookings } = useBookingState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4">Event Booking</h2>
      <p className="mb-2">Available Slots: {availableSlots}</p>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>
      <button
        onClick={() => bookSlot(name, email)}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2"
      >
        Book Now
      </button>
      <button
        onClick={resetBookings}
        className="bg-gray-500 text-white px-4 py-2 rounded w-full"
      >
        Reset
      </button>

      <h3 className="text-lg font-bold mt-6">Confirmed Bookings ({bookings.length}/{EVENT_SLOTS})</h3>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id} className="flex justify-between items-center border-b py-2">
            {booking.name} ({booking.email})
            <button
              onClick={() => cancelBooking(booking.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-bold mt-6">Waiting List ({waitingList.length})</h3>
      <ul>
        {waitingList.map((wait) => (
          <li key={wait.id} className="py-2">{wait.name} ({wait.email})</li>
        ))}
      </ul>
    </div>
  );
};

export default EventBooking;
