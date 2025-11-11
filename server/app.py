from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, Customer, Stylist, Service, stylist_service, Booking, Review
from mpesa import get_mpesa_access_token
from datetime import datetime
import os
import base64
from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///beauty_parlour.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret"  # change this in production!


CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:5173",
        "https://beauty-parlor-app-ztgj.vercel.app"
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ---------------- AUTH ---------------- #
def admin_required(fn):
    """Decorator to check if the user is admin"""
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = Customer.query.get(current_user_id)
        if not user or not user.is_admin:
            return {"error": "Admin access required"}, 403
        return fn(*args, **kwargs)
    return wrapper

class Register(Resource):
    def post(self):
        data = request.get_json()
        if Customer.query.filter_by(phone=data["phone"]).first():
            return {"error": "Phone already registered"}, 400

        hashed_pw = bcrypt.generate_password_hash(data["password"]).decode()
        is_admin = data.get("is_admin", False)
        customer = Customer(name=data["name"], phone=data["phone"], password_hash=hashed_pw, is_admin=is_admin)
        db.session.add(customer)
        db.session.commit()

        access_token = create_access_token(identity=str(customer.id))
        return {"customer": customer.to_dict(), "access_token": access_token}, 201


class Login(Resource):
    def post(self):
        data = request.get_json()
        customer = Customer.query.filter_by(phone=data["phone"]).first()
        if not customer or not bcrypt.check_password_hash(customer.password_hash, data["password"]):
            return {"error": "Invalid credentials"}, 401

        access_token = create_access_token(identity=str(customer.id))
        return {"customer": customer.to_dict(), "access_token": access_token}, 200


class Me(Resource):
    @jwt_required()
    def get(self):
        current_customer_id = get_jwt_identity()
        customer = Customer.query.get(current_customer_id)
        if not customer:
            return {"error": "Customer not found"}, 404
        
        # Explicitly include is_admin
        return {
            "customer": {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "is_admin": customer.is_admin
            }
        }, 200



# ---------------- SERVICES ---------------- #
class ServiceList(Resource):
    
    def get(self):
        services = Service.query.all()
        services_data = []
        for s in services:
            s_dict = s.to_dict()
            s_dict["stylists"] = [stylist.to_dict() for stylist in s.stylists]
            services_data.append(s_dict)
        return services_data, 200

    @jwt_required()
    def post(self):
        data = request.get_json()
        title = data.get("title")
        description = data.get("description") or ""
        price = data.get("price")
        image_url = data.get("image_url") # Get image_url

        if not title or price is None:
            return {"error": "Title and price are required"}, 400

        service = Service(title=title, description=description, price=float(price), image_url=image_url) # Pass image_url
        db.session.add(service)
        db.session.commit()
        return service.to_dict(), 201


class ServiceDetail(Resource):
    @jwt_required()
    def get(self, service_id):
        service = Service.query.get_or_404(service_id)
        s_dict = service.to_dict()
        s_dict["stylists"] = [stylist.to_dict() for stylist in service.stylists]
        return s_dict, 200

    @jwt_required()
    def put(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"error": "Service not found"}, 404

        data = request.get_json()
        service.title = data.get("title", service.title)
        service.description = data.get("description", service.description)
        service.price = float(data.get("price", service.price))
        service.image_url = data.get("image_url", service.image_url) # Update image_url

        db.session.commit()
        return service.to_dict(), 200

    @jwt_required()
    def delete(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"error": "Service not found"}, 404

        db.session.delete(service)
        db.session.commit()
        return {}, 204

# ---------------- BOOKINGS ---------------- #
class BookingList(Resource):
    @jwt_required()
    def get(self):
        current_customer_id = get_jwt_identity()
        bookings = Booking.query.filter_by(customer_id=int(current_customer_id)).all()
        return [b.to_dict() for b in bookings], 200

    @jwt_required()
    def post(self):
        current_customer_id = get_jwt_identity()
        data = request.get_json()
        customer = Customer.query.get(current_customer_id)
        stylist = Stylist.query.get(data["stylist_id"])
        service = Service.query.get(data["service_id"])

        if not customer or not stylist or not service:
            return {"error": "Invalid booking data"}, 400

        # Check stylist offers this service
        if service not in stylist.services:
            return {"error": f"Stylist '{stylist.name}' does not offer '{service.title}'"}, 400

        appointment_time_str = data.get("appointment_time")
        appointment_time = None
        if appointment_time_str:
            try:
                # parse ISO format from frontend
                appointment_time = datetime.fromisoformat(appointment_time_str)
            except ValueError:
                return {"error": "Invalid datetime format"}, 400
        
        new_booking = Booking(
            customer_id=customer.id,
            stylist_id=stylist.id,
            service_id=service.id,
            appointment_time=appointment_time
        )
        db.session.add(new_booking)
        db.session.commit()
        return {"booking": new_booking.to_dict()}, 201
    
# ---------------- STYLISTS ---------------- #
class StylistListResource(Resource):
    @jwt_required()
    def get(self):
        stylists = Stylist.query.all()
        return [s.to_dict(rules=("-services.stylists", "-bookings.stylist")) for s in stylists], 200

    @admin_required
    def post(self):
        data = request.get_json()
        name = data.get("name")
        bio = data.get("bio")
        service_ids = data.get("service_ids", [])

        if not name:
            return {"error": "Name is required"}, 400

        services = Service.query.filter(Service.id.in_(service_ids)).all() if service_ids else []

        stylist = Stylist(name=name, bio=bio, services=services)
        db.session.add(stylist)
        db.session.commit()

        return stylist.to_dict(rules=("-services.stylists", "-bookings.stylist")), 201

class StylistResource(Resource):
    # @jwt_required()
    def get(self, stylist_id):
        stylist = Stylist.query.get_or_404(stylist_id)
        return stylist.to_dict(rules=("-services.stylists", "-bookings.stylist")), 200

    @admin_required
    def put(self, stylist_id):
        stylist = Stylist.query.get_or_404(stylist_id)
        data = request.get_json()

        stylist.name = data.get("name", stylist.name)
        stylist.bio = data.get("bio", stylist.bio)

        service_ids = data.get("service_ids")
        if service_ids is not None:
            stylist.services = Service.query.filter(Service.id.in_(service_ids)).all()

        db.session.commit()
        return stylist.to_dict(rules=("-services.stylists", "-bookings.stylist")), 200

    @admin_required
    def delete(self, stylist_id):
        stylist = Stylist.query.get_or_404(stylist_id)
        db.session.delete(stylist)
        db.session.commit()
        return {"message": "Stylist deleted"}, 200

# ------------------ ADMIN RESOURCES ------------------ #

class AdminAnalyticsSummary(Resource):
    @admin_required
    def get(self):
        total_users = db.session.query(db.func.count(Customer.id)).scalar()
        total_bookings = db.session.query(db.func.count(Booking.id)).scalar()
        total_stylists = db.session.query(db.func.count(Stylist.id)).scalar()

        # Calculate total revenue by joining Booking and Service tables
        total_revenue = db.session.query(db.func.sum(Service.price)) \
                                  .join(Booking, Service.id == Booking.service_id) \
                                  .scalar() or 0

        # Bookings per service
        bookings_per_service_query = db.session.query(Service.title, db.func.count(Booking.id).label('booking_count')) \
                                               .join(Booking, Service.id == Booking.service_id) \
                                               .group_by(Service.title) \
                                               .order_by(db.desc('booking_count')) \
                                               .all()
        
        bookings_per_service = [{"service_name": title, "count": count} for title, count in bookings_per_service_query]

        # Bookings per stylist
        bookings_per_stylist_query = db.session.query(Stylist.name, db.func.count(Booking.id).label('booking_count')) \
                                               .join(Booking, Stylist.id == Booking.stylist_id) \
                                               .group_by(Stylist.name) \
                                               .order_by(db.desc('booking_count')) \
                                               .all()

        bookings_per_stylist = [{"stylist_name": name, "count": count} for name, count in bookings_per_stylist_query]


        return {
            "summary": {
                "total_users": total_users,
                "total_bookings": total_bookings,
                "total_stylists": total_stylists,
                "total_revenue": f"{total_revenue:.2f}"
            },
            "bookings_per_service": bookings_per_service,
            "bookings_per_stylist": bookings_per_stylist
        }, 200

class AdminUserList(Resource):
    @admin_required
    def get(self):
        users = Customer.query.all()
        return [user.to_dict() for user in users], 200

class AdminBookingList(Resource):
    @admin_required
    def get(self):
        bookings = Booking.query.all()
        # Enhance booking data with details for admin view
        bookings_data = []
        for b in bookings:
            b_dict = b.to_dict()
            b_dict['customer_name'] = b.customer.name
            b_dict['stylist_name'] = b.stylist.name
            b_dict['service_name'] = b.service.title
            b_dict['service_price'] = b.service.price
            bookings_data.append(b_dict)
        return bookings_data, 200


# ------------------ MPESA RESOURCES ------------------ #
class InitiateMpesaPayment(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        amount = data.get("amount")
        phone_number = data.get("phone_number")
        booking_id = data.get("booking_id")

        if not all([amount, phone_number, booking_id]):
            return {"error": "Amount, phone number, and booking_id are required"}, 400

        booking = Booking.query.get(booking_id)
        if not booking:
            return {"error": "Booking not found"}, 404

        access_token = get_mpesa_access_token()
        if not access_token:
            return {"error": "Could not get M-Pesa access token"}, 500

        api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        headers = {"Authorization": f"Bearer {access_token}"}

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        shortcode = os.getenv("MPESA_SHORTCODE")
        passkey = os.getenv("MPESA_PASSKEY")
        password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": f"{os.getenv('BASE_URL')}/mpesa-callback",
            "AccountReference": f"Booking {booking_id}",
            "TransactionDesc": f"Payment for booking {booking_id}",
        }

        try:
            response = requests.post(api_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json(), 200
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}, 500

class MpesaCallback(Resource):
    def post(self):
        data = request.get_json()
        # Process the callback data here
        print("M-Pesa Callback:", data)
        return {"ResultCode": 0, "ResultDesc": "Accepted"}, 200



# ------------------ REVIEW RESOURCES ------------------ #
class ReviewList(Resource):
    @jwt_required()
    def post(self):
        current_customer_id = get_jwt_identity()
        data = request.get_json()
        rating = data.get("rating")
        comment = data.get("comment")
        stylist_id = data.get("stylist_id")

        if not rating or not stylist_id:
            return {"error": "Rating and stylist_id are required"}, 400

        if not (1 <= rating <= 5):
            return {"error": "Rating must be between 1 and 5"}, 400

        # Check if the customer has booked a service with this stylist
        booking_exists = Booking.query.filter_by(
            customer_id=current_customer_id,
            stylist_id=stylist_id
        ).first()

        if not booking_exists:
            return {"error": "You can only review stylists you have booked a service with."}, 403

        review = Review(
            customer_id=current_customer_id,
            stylist_id=stylist_id,
            rating=rating,
            comment=comment
        )
        db.session.add(review)
        db.session.commit()
        return review.to_dict(), 201

class StylistReviews(Resource):
    def get(self, stylist_id):
        stylist = Stylist.query.get_or_404(stylist_id)
        reviews = Review.query.filter_by(stylist_id=stylist.id).all()
        return [review.to_dict() for review in reviews], 200


# ------------------ RESOURCES ------------------ #
api.add_resource(Register, "/register")
api.add_resource(Login, "/login")
api.add_resource(Me, "/me")
api.add_resource(ServiceList, "/services")
api.add_resource(ServiceDetail, "/services/<int:service_id>")
api.add_resource(BookingList, "/bookings")
api.add_resource(StylistListResource, "/stylists")
api.add_resource(StylistResource, "/stylists/<int:stylist_id>")

# Admin routes
api.add_resource(AdminAnalyticsSummary, "/admin/analytics/summary")
api.add_resource(AdminUserList, "/admin/users")
api.add_resource(AdminBookingList, "/admin/bookings")

# M-Pesa routes
api.add_resource(InitiateMpesaPayment, "/initiate-mpesa-payment")
api.add_resource(MpesaCallback, "/mpesa-callback")

# Review routes
api.add_resource(ReviewList, "/reviews")
api.add_resource(StylistReviews, "/stylists/<int:stylist_id>/reviews")


if __name__ == "__main__":
    app.run(debug=True)
