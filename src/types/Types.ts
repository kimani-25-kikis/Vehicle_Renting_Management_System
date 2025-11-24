export type UserFormValues={
    email: string; 
    password: string;
    first_name:string;
    last_name:string;
    phone_number:string
}


export type OrderFormValues={
    restaurant_id:number;
    customer_id: number;
    menu_item_id:number;
    total_amount: number;
    order_type:'dine_in' | 'takeaway' | 'delivery'
}

export interface User{
    user_id:number;
    first_name:string;
    last_name:string;
    email:string;
    phone_number:string;
    created_at:string;
    user_type:string
}



export interface UserStats {
    totalOrders: number;
    favoriteItems: number;
    totalSpent: number;
    loyaltyPoints: number;
}

export interface UserStatsResponse{
    success:boolean;
    data:UserStats;
}


export interface VehicleSpecification {
    vehicle_spec_id: number
    manufacturer: string
    model: string
    year: number
    fuel_type: string
    engine_capacity?: number
    transmission: 'Manual' | 'Automatic'
    seating_capacity: number
    color?: string
    features?: string
    vehicle_type: 'two-wheeler' | 'four-wheeler'
    created_at: string
    updated_at: string
}

export interface Vehicle {
    vehicle_id: number
    vehicle_spec_id: number
    rental_rate: number
    availability: boolean
    current_location?: string
    created_at: string
    updated_at: string
    specification: VehicleSpecification
}

export interface VehiclesResponse {
    vehicles: Vehicle[]
    total: number
    page: number
    limit: number
}

export interface VehicleQueryParams {
    page?: number
    limit?: number
    location?: string
    availability?: boolean
    fuel_type?: string
    transmission?: string
    vehicle_type?: string
}

