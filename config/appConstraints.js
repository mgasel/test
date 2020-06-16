module.exports={

   APP_CONST_VALUE:{
        MAX_DISTANCE:500000,
        PENDING:'PENDING',
        COMPLETED:'COMPLETED',
        REJECTED:'REJECTED',
        CANCELLED:'CANCELLED',
        SCHEDULED:'SCHEDULED',
        CONFIRMED:'CONFIRMED',
        ACCEPTED:'ACCEPTED',
        PICKUP_ORDER:'PICKUP_ORDER',
        DELIVERED:'DELIVERED',
        ASSIGNED_ORDER:'ASSIGNED',
        PROMO:'PROMO',
        NET_BANKING:'NET_BANKING',
        CREDIT_DEBIT_CARD:'CREDIT_DEBIT_CARD',
        CASH_ON_DELIVERY:'CASH_ON_DELIVERY',
        ASSIGNED:'ASSIGNED',
        PICKEDUP:'PICKEDUP',
        INLAUNDRY:'INLAUNDRY',
        REASSIGNED:'REASSIGNED',
        DELEVERED:'DELEVERED',
        SLOTE:'SLOTE',
        RESCHEDULE:"RESCHEDULE",
        RESCHEDULED:"RESCHEDULED",
        ASK_RESCHEDULE:"ASK_RESCHEDULE",
        HANDLE:"HANDLE",
        COLLECT:"COLLECT",
        PICKEDUPFROMLAUNDRY:"PICKEDUPFROMLAUNDRY",
        MOVE:"MOVE",
        UNDERPROCESS:"UNDERPROCESS",
        DRIVE_ARRIVING:'DRIVE_ARRIVING',
        UPDATE:"UPDATE",
        REMINDER:"REMINDER"
        
    }, 



   NOTIFICATION:{
    EMAIL_NOTIFICATION_SUBJECT:{EN:'Please make sure your availability to delevery your booking at given dilevery time',AR:'من فضلك تأكد أنك متواجد في الوقت المتفق علي لتسليم الحجز'},
    SUBJECT:{EN:'Regarding to delivery order from 3ndk',AR:'بخصوص طلب التوصيل من عندك'}
   },


   DRIVER_DATA_EMPTY:{
        success:0,
        statusCode: 400,
        msg:{EN:'Driver data should not empty',AR:'بيانات مندوب التوصيل لا يجب أن تكون فارغة'}
   },

   INVALID_DRIVER_ID2:{ 
        success:0,
        statusCode: 400,
        msg:{EN:'Driver id you have sent is invalid',AR:'هوية مندوب التوصيل التي أرسلتها غير صحيحة'}
   },

   UPDATED_DRIVER_LOCATION:{ 
        success:1,
        statusCode: 200,
        msg:{EN:'Driver location has been successfully updated',AR:'تم تحديث موقع مندوب التوصيل بنجاح'}
   },

   RECIEVING_REQUEST:{EN:'You recieved a new booking request in your nearest area please go through it',AR:'لقد تلقيت طلب حجز جديد في أقرب منطقة إليك. من فضلك راجعه.'},

   APP_CONST_MESSAGE:{
    MESSAGE_TYPE_ASSIGNED:{EN:'ASSIGNED',AR:'تم التحديد'}
   },



   SOCKET_CONNECTED:{
    statusCode: 200,
    success:1,
    msg: {EN:'Successfully connected to socket',AR:'تم الإتصال بالمقبس بنجاح'}
   },


   ERROR_WHILE_CONNECTING_SOCKET:{
    success:0,
    statusCode: 401,
    msg:{EN:'Invalid user id or accessToken',AR:'هوية مستخدم غير صحيحة أو رمز دخول غير صحيح'},
   },


    ERROR_IN_CREATING_CHAT:{
        success:0,
        statusCode: 400,
        msg:{EN:'Error while creating chat in',AR:'حدث خطأ أثناء الدردشة في '},
    },


    CHAT_CREATED_SUCCESSFULLY:{
        success:1,
        statusCode: 200,
        msg:{EN:'Chat has been created successfully',AR:'تم إنشاء الدردشة بنجاح'},
    },
    TOKEN_LINK_EXPIRED:{
     success: 0,
     statusCode: 400,
     msg:{
     EN: 'Your link has been expired'
     //,AR:'هوية مستخدم غير صحيحة أو رمز دخول غير صحيح'
    }
},
    ADMIN_NOT_FOUND:{
     success: 0,
     statusCode: 404,
     msg:{
     EN:'Invalid Email id for Admin'
     //,AR:'هوية مستخدم غير صحيحة أو رمز دخول غير صحيح'
    }

  
    },

   INVALID_CHOICE:{EN:"The choice you have entered is invalid",AR:'الاختيار الذي أدخلته غير صحيح'},
   CHOICE:{EN:"Choice is required",AR:'الاختيار مطلوب'},
   OTP_ID_REQUIRED:{EN:'otp id is required',AR:' الرجاء تسجيل كود رقم المرور لمرة واحدة'},
   OTP_REQUIRED:{EN:'Otp is required',AR:'الرجاء تسجيل رقم المرور لمرة واحدة '},
   ORIGINAL:{EN:'Original image url',AR:'عنوان الصورة الأصلية'},
   THUMBNAIL:{EN:'Thumbnail image url',AR:'عنوان صورة الوصف'},
   NAME:{EN:'Name is required',AR:'الإسم مطلوب'},
   EMAIL_ADDRESS:{EN:'Email address is required',AR : 'الرجاء تسجيل البريد الألكتروني'},
   VALID_EMAIL_ADDRESS:{EN:'Please enter valid email address',AR:'الرجاء إدخال بريد ألكتروني صحيح'},
   PHONE_NUMBER:{EN:'Phone number is required',AR:'رقم الهاتف مطلوب'},
   CALLING_CODE:{EN:'Calling code is required',AR:'الرجاء إدخال كود الاتصال'},
   PASSWORD:{EN:'password is required',AR:'الرجاء إدخال  كلمة المرور'},
   USERNAME:{EN:'User name is required',AR:'الرجاء إدخال اسم المستخدم'},
   NUMERIC_PHONE_NUMBER:{EN:'Phone number should be numeric',AR:'يجب أن يكون رقم الهاتف رقمياً'},
   DEVICE_TYPE:{EN:'Device type is required',AR:'الرجاء تحديد نوع الجهاز'},
   DEVICE_TOKEN:{EN:'Device token is required',AR:'الرجاء إدخال رمز الجهاز '},
   REGISTRATIONS_MESSAGE:{EN:'Verify email address',AR:'الرجاء اثبات صحة البريد الإلكتروني'},
   CLICK_BELOW:{EN:'Click on the below link to verify your email address',AR:'الرجاء الضغط على الرابط الموجود بالأسفل لإثبات صحة بريدك الألكتروني'},
   CLICK_HERE:{EN:'Click here to verify your email address',AR:'الرجاء الضغط هنا لإثبات صحة بريدك الألكترونى'},
   USER_SUCCESSFULLY_CREATED:{EN:'User has been created successfully',AR:'تم إنشاء اسم مستخدم بنجاح'},
   VERIFICATION_ID:{EN:'Verification id is rquired',AR:'رقم التحقق/الإثبات مطلوب'},
   TOKEN:{EN:'Token is required',AR:'الرجاء تسجيل رمز الدخول'},
   INVALID_TOKEN_KEY:{EN:'Invalid token key url',AR:'عنوان URL غير صحيح'},
   INVALID_VERIFICATION_ID:{EN:'Invalid verification id',AR:'كود التحقق/الإثبات غير صحيح'},
   EMAIL_ALREADY_VERIFIED:{EN:'Sorry ! your email address is already verified',AR:'عذرا ً!   بريدك الإلكترونى تم التحقق منه مسبقًا'},
   EMAIL_VERIFIED:{EN:'Thank you ! your email address has been verified successfully',AR:'شكراً لك! تم التحقق من صحة بريدك الإلكترونى بنجاح'},
   EMAIL_NOT_REGISTERED:{EN:'The email address you have entered is not registered. please register first.',AR:'البريد الإلكترونى الذي قمت بإدخاله غير مُسجل. برجاء التسجيل أولا ً.'},
   INVALID_EMAIL_PASSWORD:{EN:'Your email address or password is invalid',AR:'البريد الإلكتروني أو كلمة المرور غير صحيحة'},
   INVALID_PHONE_PASSWORD:{EN:'Your phone number or password is invalid',AR:'رقم الهاتف أو كلمة المرور غير صحيحة'},
   EMAIL_ALREADY:{EN:'The email address you have entered is already registered',AR:'البريد الإلكترونى الذي أدخلته مُسجل من قبل'},
   PHONE_ALREADY:{EN:'The phone number you have entered is already registered',AR:'رقم الهاتف الذي أدخلته مُسجل من قبل'},
   INVALID_COUPON:{EN:'The coupon code you have entered is invalid',AR:'كود الكوبون الذي أدخلته غير صحيح'},
   SUCCESSFULLY_LOG_IN:{EN:'User successfully logged in',AR:'تم دخول المستخدم بنجاح'},
   FORGOT_FIELD:{EN:'Forgot field is required',AR:'خانة النسيان مطلوبة'},
   NOT_A_VALID_FORGOT_EMAIL:{EN:'The email address you have entered is not registered',AR:'البريد الإلكترونى الذي قمت بإدخاله غير مُسجل '},
   INVALID_FORGOT_FIELD:{EN:'Forgot field should either email address or phone number',AR:'خانة النسيان لابد أن تكون رقم هاتم أو عنوان بريد إلكتروني'},
   CLICK_BELOW_FORGOT:{EN:'Click on the below link to change your password',AR:'الرجاء الضغط على الرابط الموجود أدناه لتغيير كلمة المرور'},
   CLICK_HERE_FORGOT:{EN:'Click here to forgot your password',AR:'الرجاء اضغط هنا إذا نسيت كلمة المرور '},
   FORGOT_SUBJECT:{EN:'3ndk forgot password',AR:'نسيت كلمة المرور الخاص بتطبيق عندك 3ndk'},
   RESET_PASSWORD_LINK:{EN:'Please go throw your email to reset your password',AR:'الرجاء مراجعة بريدك الالكتروني لعمل كلمة مرور جديدة'},
   RESET_PASSWORD_LINK_PHONE:{EN:'Please go throw your email to reset your password',AR:'الرجاء مراجعة بريدك الالكتروني لعمل كلمة مرور جديدة'},
   VERIFICATION_CODE:{EN:'Verification code is required',AR:'رقم التحقق مطلوب'},
   INVALID_TOKEN_KEY_OR_CODE:{EN:'Invalid token key or verification code',AR:'كود التحقق أو المفتاح الرمزي غير صحيح'},
   LINK_EXPIRED:{EN:'Link has been expired',AR:'إنتهت صلاحية الرابط'},
   PASSWORD_SUCCESSFULLY_UPDATED:{EN:'Password has been successfully updated',AR:'تم تحديث كلمة المرور بنجاح'},
   NEW_PASSWORD:{EN:'New Password is required',AR:'الرجاء إدخال كلمة المرور'},
   CURRENT_PASSWORD:{EN:'Current password is required',AR:'الرجاء إدخال كلمة المرور الحالية'},
   CONFIRM_PASSWORD:{EN:'Confirm password is required',AR:'الرجاء تأكيد كلمة المرور'},
   ACCESS_TOKEN:{EN:'Access token is required',AR:'الرجاء إدخال رمز الدخول'},
   UNAUTHORIZED:{EN:'unauthorized or expired accessToken',AR:'رمز الوصول منتهى الصلاحية أو غير مصرح به'},
   INVALID_CURRENT_PASSWORD:{EN:'Invalid current password',AR:'كلمة المرور الحالية غير صحيحة '},
   PASSWORD_AND_CONFIRM_PASSWORD:{EN:'Password and confirm password must be same',AR:'لابد من تطابق كلمة المرور وتأكيد كلمة المرور'},
   NEW_NOT_EQUAL_TO_CONFIRM:{EN:'New password and current password should not be same',AR:'لا يجب أن تكون كلمة المرور الجديدة هي نفس كلمة المرور الحالية'},
   CHANGED_PASSWORD:{EN:'Your password has been successfully changed',AR:'تم تغير كلمة المرور الخاصة بك بنجاح'},
   PHONE_NUMERIC:{EN:'Phone number should be numeric',AR:'يجب أن يكون رقم الهاتف رقمياً'},
   SERVICE_NAME:{EN:'Service name is required',AR:'اسم الخدمة مطلوب'},
   SERVICE_PIC_ORIGINAL:{EN:'Service pic original is required',AR:'الرجاء إدخال الصورة الأصلية للخدمة'},
   SERVICE_PIC_THUMBNAIL:{EN:'Service pic thumbnail is required',AR:'الرجاء إدخال الصورة المصغرة/ثامبنيل للخدمة'},
   ALREADY_SERVICE:{EN:'The service name you have entered is already registered',AR:'اسم الخدمة التي قمت بتسجيلها مُسجل بالفعل'},
   SERVICE_SUCCESSFULLY_CREATED:{EN:'Service has been created successfully',AR:'تم إنشاء الخدمة بنجاح'},
   UNAUTHORIZED_ADMIN:{EN:'Unauthorized admin',AR:'مستخدم غير مصرح له'},
   SUCCESS:{EN:'Success',AR:'تمت العملية بنجاح'},
   PROFILE_SUCCESSFULLY:{EN:'Profile successfully updated',AR:'تم تحديث الملف الخاص بك بنجاح'},
   LICENCE_PIC_ORIGINAL:{EN:'Licence pic original is required',AR:'الرجاء إدخال الصورة الأصلية للرخصة'},
   LICENCE_PIC_THUMBNAIL:{EN:'Licence pic thumbnail is required',AR:'الرجاء إدخال الصورة المصغرة/ثامبنيل من الرخصة '},
   LOGIN_CREDENTIALS:{EN:'Login credentials for laundryapp',AR:'معلومات الدخول لتطبيق المغسلة'},
   YOUR_CREDENTIALS1:{EN:'Your email address and password for laundry app is given below',AR:'بيانات دخولك لتطبيق المغسلة متوفر بالأسفل'},
   SUSPENDED_ACCOUNT:{EN:'This account has been suspended by admin. please contact to 3ndk',AR:'تم وقف هذا الحساب من قبل الشخص المسؤول. الرجاء التواصل مع عندك'},
   CLICK_BELOW_TO_CHANGE_PASSWORD:{EN:'Click here to change your password',AR:'الرجاء الضغط هنا لتغيير كلمة المرور'},
   CLICK_HERE_TO_RESET:{EN:'Click here to reset your password',AR:'الرجاء الضغط هنا لإعادة ضبط كلمة المرور'},
   CHANGE_ALSO:{EN:'You can change your password by given link',AR:'يمكنك تغيير كلمة المرور على الرابط الموجود'},
   DRIVER_SUCCESSFULLY_CREATED:{EN:'Driver has been created successfully',AR:'تم إنشاء مندوب التوصيل بنجاح'},
   LAUNDRY_NAME:{EN:'Laundry name is required',AR:'اسم المغسلة مطلوب'},
   LAUNDRY_ADDRESS:{EN:'Laundry address is required',AR:' عنوان المغسلة مطلوب'},
   LAUNDRY_LONG:{EN:'Laundry long is required',AR:'مطلوب إدخال دائرة عرض موقع المغسلة'},
   LAUNDRY_LAT:{EN:'Laundry lat is required',AR:' مطلوب إدخال خط طول موقع المغسلة'},
   LAUNDRY_ALREADY_CREATED:{EN:'This laundry has been already created',AR:'تم إنشاء تطبيق هذه المغسلة من قبل'},
   LAUNDRY_CREATED_SUCCESSFULLY:{EN:'Laundry has been created successfully',AR:'تم إنشاء المغسلة بنجاح'},
   USER_ID:{EN:'User id is required',AR:'اسم المستخدم مطلوب'},
   PAGE_NUMBER:{EN:'Page number is required',AR:'رقم الصفحة مطلوب'},
   PER_PAGE:{EN:'Per page is required',AR:'مطلوب لكل صفحة'},
   SUCCESSFULLY_CHANGED_STATUS_OF_USER:{AR:'Status has been successfully changed',EN:'تم تغيير الحالة الخاصة بك بنجاح'},
   DRIVER_ID:{EN:'Driver id is required',AR:'رقم هوية مندوب التوصيل مطلوب'},
   DRIVER_LAT:{EN:'Driver lat is required',AR:'مطلوب إدخال خط الطول لمندوب التوصيل'},
   DRIVER_LONG:{EN:'Driver long is required',AR:'مطلوب إدخال دائرة العرض لمندوب التوصيل '},
   USER_LAT:{EN:'User lat is required',AR:'مطلوب إدخال خط الطول للمستخدم'},
   USER_LONG:{EN:'User long is required',AR:'مطلوب إدخال دائرة العرض للمستخدم'},
   SERVICE_DELETED:{EN:'Service successfully deleted',AR:'تم حذف الخدمة بنجاح'},
   SERVICE_EDIT:{EN:'Service successfully edited',AR:'تم تعديل الخدمة بنجاح'},
   SEND_CORRECT:{EN:'Status should either DELETE or EDIT',AR:'يجب أن يتم تعديل الحالة أو حذفها'},
   DRIVER:'DRIVER',
   USER:'USER',
   LOGOUT:{EN:'Successfully logout',AR:'تم تسجيل الخروج بنجاح'},
   SERVICE_ID:{EN:'Service id is required',AR:'الرجاء إدخال كود الخدمة'},
   LAUNDRY_ITEM_ID: {EN:'laundry item id is required',AR:'الرجاء إدخال كود الخدمة'},
   CATEGORY_ID:{EN:'Category id is required',AR:'معرف الفئة مطلوب'},
   DRIVER_ID_VALID:{EN:'Driver id should be in valid form',AR:'رقم هوية مندوب التوصيل يجب إدخاله بصورة صحيحة '},
   INVALID_DRIVER_ID:{EN:'The driver id you have sended is not exists',AR:'رقم هوية مندوب التوصيل الذي أرسلته غير موجود'},
   IMAGE_SUCESSFULLY_UPLOADED:{EN:'Image successfully uploaded',AR:'تم تحميل الصورة بنجاح'},
   INVALID_OR_UNAUTHORIZE_TOKEN:{EN:'Inavalid or unauthorize admin',AR:'مستخدم غير صحيح أو مُصرح له'},
   FILE:{EN:'File is required',AR:'الملف مطلوب'},
   STATUS:{EN:'Status should either DELETE or EDIT',AR:'يجب أن يتم تعديل الحالة أو حذفها '},
   KEY:{EN:'Status should either DELETE or BLOCK',AR:'يجب أن يكون المفتاح إما DELETE أو BLOCK '},
   LAUNDRY_ID:{EN:'Laundry id is required',AR:' رقم هوية المغسلة مطلوب'},
   LAUNDRY_ID_NOT_VALID:{EN:'Laundry id should be in valid form',AR:'رقم هوية المغسلة يجب إدخاله بصورة صحيحة'},
   LAUNDRY_DELETED:{EN:'Laundry has been deleted successfully',AR:'تم حذف المغسلة بنجاح'},
   SUCCESS_GOTO_EMAIL:{EN:'You have successfully signup. please go throw your email to verify it and login',AR:'لقد قمت بالتسجيل بنجاح، الرجاء إثبات صحة بريدك الألكترونى لتسجيل الدخول'},
   PLEASE_VERIFY_EMAIL:{EN:'Please go through your email to verify you email',AR:'الرجاء الدخول على البريد الألكترونى للتحقق من حسابك'},
   VALID_EMAIL_ADDRESS_FORLOGIN:{EN:'The emial address you have entered is not valid',AR:'البريد الألكترونى الذي قمت بإدخالة غير صحيح'},
   SERVICE_ID_NOT_VALID:{EN:'Service id should be in valid form or mongo id',AR:'لابد أن يكون كود الخدمة في شكلة الصحيح أو كود مونجو'},
   CATEGORY_ID_NOT_VALID:{EN:'Category id should be in valid form or mongo id',AR:'يجب أن يكون معرف الفئة في شكل صالح أو معرف mongo'},
   SERVICE_CATEGORY_SERIES:{EN:'Service category series is required',AR:'سلسلة فئة الخدمة مطلوبة'},
   SERVICE_ITEM_PIC_ORIGINAL:{EN:'Service item pic original is required',AR:'الصورة الاصلية لعنصر الخدمة مطلوبة'},
   SERVICE_ITEM_PIC_THUMBNAIL:{EN:'Service item pic thumbnail is required',AR:'الصورة المصغرة لعنصر الخدمة مطلوبة'},
   AMMOUNT_PER_ITEM:{EN:'Ammount per item is required',AR:'المقدار حسب كل عنصر مطلوب'},
   ALREADY_CREATED_ITEM:{EN:'You have already created this item for this service',AR:'لقد قمت بالفعل بإنشاء هذا الصنف لهذه الخدمة '},
   ALREADY_CREATED_CATEGORY:{EN:'You have already created this category for this service',AR:'لقد قمت بالفعل بإنشاء هذا الصنف لهذه الخدمة '},
   ITEM_CREATED:{EN:'Item has created successfully',AR:'تم إنشاء العنصر بنجاح'},
   SERVICE_ITEM_ID:{EN:'Service item id is required',AR:'الرجاء إدخال كود العنصر الخدمة'},
   SERVICE_CATEGORY_ID:{EN:'Service category id is required',AR:'معرف فئة الخدمة مطلوب'},
   ITEM_UPDATED_SUCCESSFULLY:{EN:'Service item has successfully updated',AR:'تم تحديث الخدمة بنجاح'},
   ITEM_DELETED_SUCCESSFULLY:{EN:'Service item has deleted successfully',AR:'تم حذف  الخدمة بنجاح'},
   PLANE_NAME:{EN:'Plane name is required',AR:'اسم الباقة مطلوب'},
   ALREADY_SUBSCRIPTION_PLAN:{EN:'The subscription plan you have entered is already registered',AR:'اشتراك الباقة الذى قمت بإدخاله مُسجل سابقًا'},
   SUBSCRIPTION_PLANE_CREATED:{EN:'Subscription plane has been created successfully',AR:'تم إنشاء اشتراك الباقة بنجاح'},
   PLANE_ID:{EN:'Plan id is required',AR:'الرجاء إدخال كود الباقة'},
   PLANE_ID_NOT_VALID:{EN:'Plan id should be a valid mongo id',AR:'يجب أن يكون كود الباقة كود مونجو صحيح'},
   INVALID_STATUS:{EN:'Invalid status value',AR:'قيمة الحاله غير صحيحة'},
   INVALID_LAUNDRY_ID:{EN:'The email id you hav entered is not valid',AR:'كود البريد الألكترونى الذي قمت الذي قمت بإدخالة غير صحيح'},
   LAUNDRY_UPDATED_SUCCESSFULLY:{EN:'Laundry has been updated successfully',AR:'تم تحديث المغسلة بنجاح'},
   PLANE_DELETED:{EN:'Plane has successfully deleted',AR:'تم حذف الباقة بنجاح'},
   ITEM_QWERY:{EN:'Item query is required',AR:'مطلوب إدخال طلب العنصر  '},
   ITEM_STATUS:{EN:'Item Status is required',AR:'مطلوب إدخال حالة العنصر'},
   ALREADY_PLAN_ITEM:{EN:'Subscription plan item already exist',AR:''},
   PLANE_ITEM_CREATED:{EN:'Plan item has been created successfully',AR:'تم إنشاء عنصر الوصف بنجاح'},
   PLANE_ITEM_DELETED:{EN:'Plan item successfully deleted',AR:'تم حذف عنصرالمخطط بنجاح'},
   NOT_VALID_PLAN:{EN:'Invalid Plan id',AR:'كود الباقة غير صحيح'},
   PLAN_EXPIRED:{EN:'Your Subscribed plan is expired repay to activate',AR:'انتهت مدة صلاحية خطة المشترك الخاصة بك للتفعيل'},
   SUCCESSFULLY_ACCEPTED:{EN:'You have successfully accepted the subscription plan',AR:'لقد وافقت على باقة الإشتراك بنجاح'},
   AMOUNT_REQUIRED:{EN:'Total amount is required',AR:'المبلغ الإجمالي مطلوب'},
   BOOKING_ID:{EN:'Booking id is required',AR:'الرجاء إدخال كود الحجز'},
   RESCHEDULE_VALUE:{EN:'Rechedule value is required',AR:'رقم تغيير الموعد مطلوب'},
   ORDER_HAS_PICKED_UP:{EN:'Order has been picked up successfully',AR:'تم استلام الطلب/الأوردر بنجاح'},
   ORDER_PICKED_UP:{EN:'Your order has picked up by',AR:'تم استلام طلبك عبر المندوب'},
   YOUR_ORDERER_HAS_DELEVERED:{EN:'Driver has delivered your ordered. Your order has completed successfully. kindly review it',AR:'تم توصيل طلبك بنجاح، يرجى التقييم'},
   DILEVER_ORDER_SUCCESS:{EN:'Oreder successfully delivered',AR:'تم إرسال الطلب/الأوردر بنجاح'},
   STATUS_ACCEPT_UPGRADE:{EN:'Status should be ACCEPT or UPGRADE',AR:'حالتك يجب أن تكون الموافقة أو التعديل.'},
   INVALID_STATUS_SUBSCRIPTION:{EN:'Status should be ACCEPT or UPGRADE',AR:'حالتك يجب أن تكون الموافقة أو التعديل.'},
   ALREADY_SUBSCRIPTION_PLAN_ACCEPTED:{EN:'You have already accepted this subscription plan',AR:'لقد قمت بالفعل بقبول باقة الإشتراك.'},
   SUCCESSFULLY_UPGRADE:{EN:'You have successfully upgrade your subscription plan',AR:'لقد قمت بتعديل باقة الاشتراك بنجاح.'},
   SUCCESSFULLY_ADDED_USER:{EN:'You have successfully added member to your plan',AR:'لقد نجحت في إضافة عضو إلى خطتك'},
   ISSUE_TITLE:{EN:'Issue title is required',AR:'يتطلب إدخال اسم المشكلة'},
   ISSUE_BODY:{EN:'Issue body is required',AR:'موضوع المشكلة مطلوب معرفتة'},
   BOOKING_DATA:{EN:'Booking data is required',AR:'يتطلب بيانات الحجز'},
   PICKUP_ADDRESS:{EN:'Pickup address is required',AR:'يتطلب معرفة عنوان الاستلام'},
   IS_QUICK_SERVICE:{EN:'isQuickService is required in true or false',AR:'هل يتطلب معرفة كويك سيرفس (الخدمة السريعة)  بالصواب أو بالخطأ'},
   PICK_UP_TIME:{EN:'Pick up time is required',AR:' وقت استلام الملابس مطلوب'},
   PICK_UP_DATE:{EN:'Pick up date is required',AR:'تاريخ استلام الملابس مطلوب'},
   DELIVERED_TIME:{EN:'Delivery time is required',AR:'وقت تسليم الملابس مطلوب'},
   DELIVERED_DATE:{EN:'Delivery date is required',AR:'تاريخ تسليم الملابس مطلوب'},
   SERVICE_CHARGE:{EN:'Service charge is required',AR:'تكلفة الخدمة مطلوبة'},
   DELIVERY_CHARGE:{EN:'Delivery charge is required',AR:'تكلفة التسليم مطلوبة '},
   QUICK_CHARGE:{EN:'Quick charge is required',AR:'تكلفة خدمة كويك مطلوبة '},
   BOOKING_CREATED:{EN:'Booking created successfully',AR:'تم إنشاء الحجز بنجاح'},
   HEX_STRING:{EN:'Hex string is required for shadow color',AR:'يتطلب السلسلة السداسية للون الظل'},
   ISSUE:{EN:'Issue is required',AR:'عنوان المشكلة مطلوب'},
   ISSUE_BY_USER:{EN:'Issue by 3ndk user',AR:'مشكلة تواجه مستخدم عندك'},
   ISSUE_BY_DRIVER:{EN:'Issue by 3ndk driver',AR:'مشكلة تواجه مندوب توصيل عندك'},
   ISSUE_CREATED_SUCCESS:{EN:'Issue has been created successfully',AR:'تم إنشاء المشكلة بنجاح'},
   RATING_BY_USER:{EN:'Ratings is required',AR:'التقييمات مطلوبة'},
   RATING_DESCRIPTION:{EN:'Rating description is required',AR:'وصف التقييم مطلوب '},
   REVIEW_CREATED:{EN:'Review created successfully',AR:'تم  انشاء المراجعة بنجاح'},
   BOOKING_ASSIGNED:{EN:'A new booking has been assigned to you',AR:"تم إسناد حجز جديد إليك"},
   BOOKING_CONFIRMED:{EN:'Your booking has been confirmed',AR:'تم تأكيد طلبك للاستلام والتوصيل'},
   RESCHEDULE_ORDER:{EN:'Do you want to reschedule order?',AR:'هل تريد تغيير موعد الطلب؟'},
   RESCHEDULE_CONFIRMED:{EN:'Your reschedule has been set to tommorrow',AR:'تم تغيير الموعد إلي الغد'},
   BOOKING_RESCHEDULED:{EN:'Your booking has been rescheduled',AR:'تم تغيير موعد حجزك'},
   HANDLE_OR_COLLECT:{EN:'Handle or collect variable is required',AR:'بيانات التسليم أو الاستلام مطلوبة'},
   HANDLE_LIST:{EN:'Handle List',AR:'قائمة التسليم'},
   COLLECT_LIST:{EN:'Collect List',AR:'قائمة الاستلام'},
   READYTOMOVE:{EN:'readyToMove is required ',AR:'خانة "جاهز للنقل" مطلوبة'},
   NOT_FOUND:{EN:'Not found',AR:'غير موجود '},
   READY_TO_MOVE:{EN:'Driver is ready to move towards your location',AR:'مندوب التوصيل متجه لموقعك لاستلام الطلب'},
   UNDER_PROCESS:{EN:"Your order is under process",AR:'تم تسليم طلبك للمغسلة '},
   PICKUP_LAUNDRY:{EN:"Your order has been pickedup from the laundry",AR:'تم تسلم طلبك من المغسلة'},
   SUCCESSFULLY_ASSIGNED:{EN:'Booking has been successfully assigned to driver',AR:'تم إسناد الحجز بنجاح إلى مندوب التوصيل'},
   PROMO_CODE:{EN:'Promo code is required',AR:'يرجي إدخال كود البرومو'},
   EXPIRY_DATE:{EN:'Expiry date is required',AR:'يرجي إدخال تاريخ الصلاحية'},
   DISCOUNT:{EN:'Discount is required',AR:'قيمة الخصم مطلوبة'},
   EXPIRY_DATE_VALID:{EN:'Expiry date shold be greater than current date',AR:'لابد أن يكون تاريخ انتهاء الصلاحية لاحقا ً زمنيا ً للتاريخ الحالي'},
   MESSAGE:{EN:'Message for promocode is required',AR:'رسالة تأكيد بروموكود مطلوبة '},
   ALREADY_PROMO:{EN:'The Promo code you have entered is already exists',AR:'كود البرومو الذي قمت بإدخالة موجود بالفعل'},
   ALREADY_COUPON:{EN:'The Coupon code you have entered already exists',AR:'كود الكوبون الذي أدخلته موجود من قبل'},
   PROMO_CODE_SUCCESS:{EN:'Promocode has created successfully',AR:'تم إنشاء برومو كود بنجاح'},
   INVALID_PROMO_CODE:{EN:'The promo code you have entered is not valid',AR:'كود البرومو الذي قمت بإدخاله غير صحيح'},
   PROMO_EXPIRED:{EN:'The promo code you have entered has expired',AR:'كود البرمو الذي قمت بإدخالة منتهى الصلاحية'},
   INVALID_EMAIL_ADDRESS:{EN:'The email address you have entered is not valid',AR:'عنوان البريد الألكترونى الذي قمت بإدخالة غير صحيح'},
   BOOKING_DATA:{EN:'Booking data is required',AR:'بيانات الحجز مطلوبة'},
   START_TIME:{EN:"Start time is required",AR:'وقت البدء مطلوب'},
   ALREADY_VEHICLE:{EN:'You have already added this vehicle',AR:'لقد قمت بالفعل بإضافة هذه العربة'},
   PICK_UP_LAT:{EN:'Pick up lat is required',AR:'مطلوب إدخال خط طول موقع الاستلام '},
   PICK_UP_LONG:{EN:'Pick up long is required',AR:'مطلوب إدخال دائرة عرض موقع الاستلام '},
   DELIVERED_LAT:{EN:'Delivery lat is required',AR:'مطلوب إدخال خط طول موقع التسليم'},
   DELIVERED_LONG:{EN:'Delivery long is required',AR:'مطلوب إدخال دائرة عرض موقع التسليم'},
   DELIVERY_ADDRESS:{EN:'Delivery address is required',AR:'عنوان التسليم مطلوب'},
   BOOKING_ACCEPTED:{EN:'Booking has been accepted successfully',AR:'تم قبول الحجز بنجاح'},
   VEHICLE_NAME:{EN:'Vehicle name is required',AR:'اسم العربة مطلوب'},
   VEHICLE_NUMBER:{EN:'Vehicle number is required',AR:'رقم العربة مطلوب '},
   DRIVER_NOT_AVAILABLE:{EN:'Driver is not available at this moment',AR:'مندوب التوصيل غير متاح هذه اللحظة'},
   OTP_SEND_SUCCESSFULLY:{EN:'Otp has been send successfully',AR:'تم إرسال كلمة المرور لمرة واحدة'},
   INVALID_OTP_CODE:{EN:'The otp code you have entered is invalid',AR:'كود كلمة المرور لمرة واحدة الذي قمت بإدخالة غير صحيح'},
   OTP_VERIFIED_SUCCESSFULLY:{EN:'Your otp has been verified successfully',AR:'تم التحقق من كود المرور لكلمة واحدة بنجاح'},
   INVALID_OTP_ID:{EN:'The id you have sent is invalid',AR:'الكود الذي قمت بإرسالة غير صحيح'},
   INVALID_USER_ID:{EN:'The user id you have send is invalid',AR:'كود المستخدم الذي قمت بإرساله غير صحيح'},
   PHONE_NOT_REGISTERED:{EN:'The phone number you have entered is not registered',AR:'رقم الهاتف الذي قمت بإرسالة غير مُسجل'},
   LOGIN_WITH_EMAIL_PHONE_NUMBER:{EN:'You can login with either valid email or phone number only',AR:'يمكنك أن تسجل بإستخدام بريد إلكترونى صحيح أو برقم هاتف فقط'},
   EXPIRED:{EN:'The otp you have entered has been expired',AR:'كلمة المرور الذي قمت بإدخاله منتهى الصلاحية'},
   INCENTIVE_REQUIRED:{EN:'Incentives are required',AR:'الحوافز مطلوبة'},
   ISSUE_TYPE:{EN:'Issue type is required',AR:'نوع المشكلة مطلوبة '},
   OVER_ALL_EXPERIENCE:{EN:'Overall experience rating is required',AR:'مطلوب تقييم الخبرة الاجمالية '},
   LAUNDRY_SERVICEL:{EN:'Laundry service rating is required',AR:'مطلوب تقييم خدمة تنظيف الملابس'},
   DRIVER_REVIEW:{EN:'Driver rating is required',AR:'مطلوب تقييم مندوب التوصيل'},
   REVIEW_UPDATED:{EN:'Review updated successfully',AR:'تم تحديث المراجعة بنجاح'},
   QUICK_CHARGE:{EN:'Quick charge is required',AR:'تكلفة خدمة كويك مطلوبة '},
   DELIVERY_CHARGE:{EN:'Delivery charge is required',AR:'تكلفة التسليم مطلوبة '},
   CHARGE_UPDATED_SUCCESSFULLY:{EN:'Charge updated successfully',AR:'تم تحديث التكلفة بنجاح'},
   CHARGE_CREATED_SUCCESSFULLY:{EN:'Charge created successfully',AR:'تم إنشاء التكلفة بنجاح'},
   DISCOUNT_NOT_MORE_100:{EN:'Discount can not be more than 100 %',AR:'لا يمكن أن يكون التخفيض أكثرمن 100%'},
   ALREADY_USED:{EN:'You have already used this promocode',AR:'لقد قمت بإستخدام البرومو كود بالفعل'},
   USER_AVAILABILITY_OPTION:{EN:'User availability paramete value is required',AR:'قيمة معيار تواجد المستخدم مطلوبة'},
   MAKE_USER_SUCCESSFULLY_AVAILABLED:{EN:'Availability request accepted successfully',AR:'تم قبول طلب التوفر بنجاح'},
   MAKE_USER_SUCCESSFULLY_UNABAILABLE:{EN:'Availability request rejected successfully',AR:'تم رفض طلب التوفر بنجاح'},
   DRIVER_ID_VALID:{EN:'Driver id is not valid',AR:'رقم هوية مندوب التوصيل غير صحيحة'},
   BOOKING_ID_VALID:{EN:'Booking id not valid',AR:'رقم هوية الحجز غير صحيح'},
   ATLEAST_ONE_ITEM:{EN:'Please add atleast one item',AR:'من فضلك أضف علي الأقل قطعة واحدة'},
   SUCCESSFULLY_UPDATED_ITEM:{EN:'Item has been successfully updated',AR:'تم تحديث الخدمة بنجاح'},
   PLANE_ITEM_ID:{EN:'Plan item id is required',AR:'رقم هوية باقة القطعة مطلوب'},
   PLANE_ID_STATUD:{EN:'Status is required',AR:'الحالة مطلوبة'},
   DRIVER_PICKED_UP_ORDER:{EN:'You have picked up an order',AR:'لقد استلمت طلبا ً'},
   CONFIRMED_BOOKING_BY_DRIVER:{EN:'You confirmed an order',AR:'لقد أكدت علي الطلب'},
   ACCEPT_ORDER_BY_DRIVER:{EN:'You confirmed an order',AR:'لقد أكدت علي الطلب'},
   BOOKING_ASSIGNED_USER_NOTIFICATION:{EN:'Make your availability at given pickup time for order',AR:'تأكد من توافرك في وقت الإستلام المسجل في الطلب'},
   USER_ACCEPTED_ORDER:{EN:'User has accepted the order. please make sure for same',AR:'المستخدم قد قبل الطلب. من فضلك تأكد من ذلك'},
   TIME_SLOT:{EN:'Time slot is required',AR:'خانة الفترة الزمنية مطلوبة'},
   BOOKING_ASSIGNED_USER_NOTIFICATION_DELEVERED:{EN:'Make your availability to delivery order on time',AR:'تأكد من توافرك لتوصيل الطلب في الميعاد المحدد'},
   BOOKING_REASSIGNED:{EN:'Your order is ready please pick it from laundry',AR:'طلبك جاهز من فضلك استلمه من المغسلة'},
   SERVICES_ID_REQUIRED:{EN:'Service id is required',AR:'الرجاء إدخال كود الخدمة'},
   CITY_NAME:{EN:'City name is required',AR:'اسم المدينة مطلوب'},
   RESHUDULED:{EN:'Your booking has been reshuduled to',AR:'تم تغيير موعد حجزك إلي'},
   NODRIVERFOUND_ONLINE:{EN:'No driver found online for booking',AR:'لا يوجد مندوب توصيل أونلاين للحجز'},
   NEW_ORDER_PLACE:{EN:'New Booking has been placed but no driver found as available in this region please manage <br />thank you',AR:'تم تعيين حجز جديد لكن لا يوجد مندوبين توصيل متاحين في هذه المنطقة. برجاء التصرف <br /> شكرا'},
   IS_CANCELED:{EN:'Is cancelled is required',AR:'تأكيد الإلغاء مطلوب'},
   ORDER_CANELLED_SUCCESSFULLY:{EN:'Your order has been cancelled successfully',AR:'تم الغاء الطلب'},
   BOOKING_CANELLED:{EN:'Your booking has been cancelled please do not go through it',AR:'تم إلغاء حجزك من فضلك لا تراجعه'},
   SUCCESSESSFULLY_RESCHEDULED:{EN:'Your order has been successfully rescheduled',AR:'تم تغيير موعد طلبك بنجاح'},
   ORDER_ALREADY_CANCELLED:{EN:'This order has been already cancelled',AR:'هذا الطلب تم إلغاؤه بالفعل'},
   ALREADY_RESCHEDULED:{EN:'You have already rescheduled this order',AR:'هذا الطلب تم تغيير موعده بالفعل'},
   NOT_AVAILABLE_USER:{EN:'Your booking has been scheduled for next day',AR:'تم تغيير موعد حجزك لليوم التالي'},
   PICKUP_HAS_RESCHEDULED:{EN:'your pick up has reschedule for next day please make availability for same',AR:'تم تغيير موعد الإستلام لليوم التالي. من فضلك تأكد من توافرك في الموعد المحدد'},
   DELIVERY_RESCHEDULED:{EN:'your delivery up has reschedule for next day please make availability for same',AR:'تم تغيير موعد توصيل طلبك لليوم التالي.  من فضلك تأكد من توافرك في الموعد المحدد'},
   COMPLETE_SMS:{EN:'3ndk has delivered your order successfully please review it',AR:'عندك وصّل طلبك بنجاح من فضلك قم بمراجعته'},
   DRIVER_MOOVING_TO_YOU:{EN:'Driver is arriving to you',AR:'مندوب التوصيل متجه لموقعك لتوصيل الطلب'},
   MESSAGE_TO_USER:{EN:'Message is required',AR:'الرسالة مطلوبة'},
   SUBJECT:{EN:'Subject is required',AR:'الموضوع مطلوب'},
   STATUS_OF_BOOKING:{EN:'Status is required',AR:'الحالة مطلوبة'},
   UPGRADE_PLAN:{EN:'Please upgrade your plan to place more order in this week',AR:'برجاء ترقية الباقة لعمل طلبات أكثر خلال هذا الأسبوع'},
   PROMO_CODE_ID:{EN:'Promocode id is required',AR:'كود الهدية/ العرض مطلوب'},
   UPGRADE_PLANE_TO_PLACE_MORE_THAN_100:{EN:'Unable to placed order, Please upgrade your plane to place order more than 100 SR',AR:'غير قادر علي تعيين الطلب. برجاء ترقية باقتك للحصول علي طلبات بأكثر من 100 ريال'},
   START_DATE:{EN:'Start date is required',AR:'تاريخ البدء مطلوب'},
   START_DATE_LESSER:{EN:'Start date can not be less than current date',AR:'تاريخ البدء لا يمكن أن يكون قبل التاريخ الحالي'},
   LOG_FOUND:{EN:"Log already exists and can not be changed",AR:'الحساب موجود بالفعل ولا يمكن تغييره'},
   SLOT_TIME:{EN:"Slot time is required",AR:'الفترة الزمنية مطلوبة'},
   SLOT_ID:{EN:"Slot id is required",AR:'رقم هوية الفترة مطلوب'},
   COUPON:{EN:"Coupon is required",AR:'الكوبون مطلوب '},
   ALREADY_BOOK_ONE_IN_THIS_WEEK:{EN:'You have already book one order in this week ',AR:'لقد حجزت بالفعل طلبا واحدا هذا الأسبوع '},
   ALREADY_BOOK_TWO_IN_THIS_WEEK:{EN:'You have already book two order in this week ',AR:'لقد حجزت بالفعل طلبين اثنين هذا الأسبوع'},
   ALREADY_BOOK_THREE_IN_THIS_WEEK:{EN:'You have already book three order in this week ',AR:'لقد قمت بالفعل بحجز ثلاثة أوامر في هذا الأسبوع'},
   VERSION:{EN:"Version is required",AR:'النسخة مطلوبة'},
   UPDATE_APPLICATION:{EN:"New version is available, please update your application",AR:'نسخة جديدة متوفرة، برجاء تحديث التطبيق'},
   ALREADY_PICKED:{EN:"Order aleady picked can not be canceled",AR:'تم إستلام الطلب بالفعل ولا يمكن إلغاؤه'},
   DISTRICT_LONG:{EN:"District long is required",AR:'مطلوب خط طول المنطقة'},
   DISTRICT_LAT:{EN:"District lat is required",AR:'مطلوب منطقة العرض'},
   DISTRICT_NAME:{EN:"DIstrict name is required",AR:'اسم الحي مطلوب'},
   DISTRICT_NAME_ALREADY:{EN:"District name already exists",AR:'اسم الحي موجود بالفعل'},
   ADDRESS:{EN:"Address is required",AR:'العنوان مطلوب'},
   DISTRICT_ID:{EN:"District id is required",AR:'معرف المنطقة مطلوب'},
   DISTRICT_ID_NOT_VALID:{EN:"District id is not valid",AR:'معرف المنطقة غير صالح'},
   DISTRICT_DELETED:{EN:"District has been deleted",AR:'تم حذف المقاطعة'},
   STATUS_FOR_LISTING:{EN:"Status for listing",AR:'حالة للإدراج'},
   DISTRICT_UPDATED:{EN:"District updated successfully",AR:'تم تحديث المنطقة بنجاح'},
   IS_ACTIVE:{EN:"Is active is required",AR:'هو نشط مطلوب'},
   LANGUAGE_TYPE:{EN:"Language type is required",AR:"تم تحديث المنطقة بن"},
   QUICK_SERVICE:{EN:"quick service is required",AR:'مطلوب خدمة سريعة'},
   AMOUNT:{EN:"amount is required",AR:'مطلوب خدمة سريعة'},
   CARD_REG_ID:{EN:"card id is required",AR:'مطلوب خدمة سريعة'},
   PAGE:{EN:"Page is required",AR:'الصفحة مطلوبة'},
   NODRIVER:{EN:"No driver found please choose another laundry",AR:'لم يتم العثور على سائق يرجى اختيار غسيل آخر'},
   LAUNDRY_SERVICE:{EN:"Laundry service rating is required",AR:'مطلوب تصنيف خدمة غسيل الملابس'},
   REMIND_USER:{EN:"Driver will reach at your pickup location in some time, do you want to cancel or reschedule?",AR:"سيصل المندوب لاستلام طلبك بعد قليل، هل تود تأجيل الموعد أو الغاءه"},
   OTP_CODE:{EN:"Your 3ndk otp code is",AR:"تطبيق عندك - رمز التأكيد"},
   FIRST_HALF:{EN:"Your booking has been delivered your booking order number ",AR:"تم تنفيذ طلبك للاستلام والتوصيل بالرقم"},
   SECOND_HALF:{EN:"please review it",AR:"يرجى التقييم"},
   NO_DISTIRCT:{EN:"No district found",AR:"لم يتم العثور على منطقة"},
   BLOCKED:{EN:"Can not place order right now",AR:"لا يمكن وضع النظام في الوقت الحالي"},
   NOT_PURCHASER:{EN:"Can not edit details you are not actual purchaser",AR:"لا يمكنك تعديل التفاصيل التي لست المشتري الفعلي"},
   ALREADY_ADDED:{EN:"Already added in plan",AR:"أضيف بالفعل في الخطة"},
   CANT_ADD_MORE_MEMBERS:{EN:"Already added maximum members in plan",AR:"تمت إضافة الحد الأقصى للأعضاء بالفعل في الخطة"},
   CANT_REMOVE_PURCHASER:{EN:"Actual purchaser of plan can't be removed",AR:"لا يمكن إزالة المشتري الفعلي للخطة"},
   BOOKING_CONFIRMED2 : {EN:"Your booking has been confirmed your booking order number is ",AR:"تم تأكيد طلبك للاستلام والتوصيل بالرقم"},
   NOT_REGISTERED : {EN:"User with this number does not exists ",AR:"المستخدم بهذا الرقم غير موجود"},
   ALREADY_SUBSCRIBED : {EN:"User with this number already subscribed",AR:"المستخدم مع هذا الرقم مشترك بالفعل"},
   PURCHASED_SUB: {EN:"You have already subscribed with other plan",AR:"المستخدم مع هذا الرقم مشترك بالفعل"},
   REGISTRATIONS_SUCESSFULL : {EN:"registration sucessfull",AR:"تم التسجيل بنجاح"},
   LOGIN_SUCESSFULL : {EN:"Login Sucessfull",AR:"نجح تسجيل الدخول"},
   VALID_OTP : {EN:"Please enter valid otp",AR:"الرجاء إدخال otp صالح"},
   ENTER_OWNER_ID:{EN:"Please Enter the owner ID",AR:'يرجى إدخال معرف المالك'},
   NUMBER_ALREADY_EXIST:{EN:"Phone Number already exist",AR:'رقم الهاتف موجود بالفعل'},
   REQUIRED_COUNTRY:{EN:'Country code is required',AR:'رمز البلد مطلوب'},
   NUMBER_INVALID : {EN:'Invalid phone number',AR:'رقم الهاتف غير صحيح'},
   INVALID_ID : {EN:'Invalid ID',AR:'رقم معرف غير صالح'},
   UPDATE : {EN:'Update Sucessfully',AR:'تحديث بنجاح'},
   ENTER_NEW_PASSWORD : {EN:'Please enter new password',AR:'يرجى إدخال كلمة المرور الجديدة'},
   EMAIL_NUMBER_USED :{EN:'Email or number alredy used',AR:'البريد الإلكتروني أو الرقم المستخدم بالفعل'}
}