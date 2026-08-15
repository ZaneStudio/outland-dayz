import {NextResponse} from "next/server"; export async function POST(){return NextResponse.json({id:`UDZ-${Date.now().toString().slice(-6)}`,status:"PAID",provider:"mock"},{status:201})}
