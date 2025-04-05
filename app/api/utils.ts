import { NextResponse } from 'next/server';

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: any) {
  return NextResponse.json({ success: true, ...data });
}

export function validateRequest(data: any, requiredFields: string[]) {
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { valid: true };
} 