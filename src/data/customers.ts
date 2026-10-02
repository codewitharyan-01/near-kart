import type { Customer } from "@/types";

export const DEMO_CUSTOMER: Customer = {
  id: "c1",
  name: "Aryan Shah",
  phone: "+91 98980 10101",
  email: "aryan.shah@example.in",
  addresses: [
    {
      id: "a1",
      label: "Home",
      name: "Aryan Shah",
      phone: "+91 98980 10101",
      line1: "B-402, Sunrise Flats, Shivranjani Road",
      landmark: "Near Shivranjani BRTS stop",
      area: "Satellite",
      city: "Ahmedabad",
      pincode: "380015",
      instructions: "Ring the bell twice, leave at door if no response",
    },
    {
      id: "a2",
      label: "Work",
      name: "Aryan Shah",
      phone: "+91 98980 10101",
      line1: "7th Floor, Titanium City Center, Anand Nagar",
      landmark: "Opposite Sachin Tower",
      area: "Satellite",
      city: "Ahmedabad",
      pincode: "380015",
      instructions: "Ask for reception, Aryan Shah",
    },
  ],
  joinedAt: "2026-06-10",
};

export const OTHER_CUSTOMERS: Customer[] = [
  {
    id: "c2",
    name: "Priya Mehta",
    phone: "+91 99043 51525",
    addresses: [
      {
        id: "a3",
        label: "Home",
        name: "Priya Mehta",
        phone: "+91 99043 51525",
        line1: "12, Silver Oak Society, Jodhpur Gam",
        landmark: "Behind ISKCON temple",
        area: "Satellite",
        city: "Ahmedabad",
        pincode: "380015",
      },
    ],
    joinedAt: "2026-06-18",
  },
  {
    id: "c3",
    name: "Rohan Desai",
    phone: "+91 95588 32323",
    addresses: [
      {
        id: "a4",
        label: "Home",
        name: "Rohan Desai",
        phone: "+91 95588 32323",
        line1: "A-11, Shivalik Plaza, Vastrapur",
        landmark: "Near Vastrapur Lake",
        area: "Vastrapur",
        city: "Ahmedabad",
        pincode: "380054",
      },
    ],
    joinedAt: "2026-07-01",
  },
  {
    id: "c4",
    name: "Kavita Joshi",
    phone: "+91 91738 83828",
    addresses: [
      {
        id: "a5",
        label: "Home",
        name: "Kavita Joshi",
        phone: "+91 91738 83828",
        line1: "5, Prahlad Nagar Society",
        landmark: "Near Rajpath Club Road",
        area: "Prahlad Nagar",
        city: "Ahmedabad",
        pincode: "380060",
      },
    ],
    joinedAt: "2026-07-15",
  },
  {
    id: "c5",
    name: "Neha Trivedi",
    phone: "+91 93777 61616",
    addresses: [
      {
        id: "a6",
        label: "Home",
        name: "Neha Trivedi",
        phone: "+91 93777 61616",
        line1: "9, Green Park, Bodakdev",
        landmark: "Opp. Rajpath Row Houses",
        area: "Bodakdev",
        city: "Ahmedabad",
        pincode: "380054",
      },
    ],
    joinedAt: "2026-08-02",
  },
];
