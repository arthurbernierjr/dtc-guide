**System Design Primer with Big Poppa Code: Building Your Digital Mansion**

*Today, we're diving deep into the wonders of System Design. Just imagine constructing an enormous, fabulous mansion, where instead of bricks and mortar, we've got servers and databases. Buckle up, because by the end of this, you'll have all the tools to design the next Twitter or even... the next digital Hogwarts!*

---

![MERN architecture](/assets/diagrams/mern-architecture.svg)

![mern architecture](https://www.dropbox.com/s/4ty5gmm1kefk7yw/arthurGraphic-01.jpg?dl=1)

Designing a system like Twitter from scratch is like building a house from the ground up. You gotta have a plan, and you gotta make sure it's solid.

First, we gotta make sure that the house stays standing, even if a storm comes through. We gotta have 5 nines of availability, which means that the house (or the website) has to be up and running 99.999% of the time. That's like building a house on stilts, so that it can handle a flood or a hurricane.

Next, we gotta make sure the house can fit all the people who wanna come through. We gotta be able to handle 100 million users, that's like building a house with a lot of rooms, so that everyone can have a place to stay.

To do this, we're gonna need a big front door, that's like a load balancer. The load balancer is gonna make sure that everyone who comes through the front door is directed to the right place.

Once inside, we're gonna need a lot of rooms, that's like having a lot of servers. The servers are gonna handle all the different requests and make sure that everyone has a place to stay.

We're also gonna need a way to keep track of everyone's stuff, that's like having a database. The database is gonna store all the tweets and the user information, so that we can keep track of everything.

Finally, we're gonna need a way to keep the place clean, that's like having monitoring and logging. We're gonna need to keep an eye on everything that's going on in the house, so that we can make sure that everything is running smoothly and fix any problems that come up.

So, in short, designing a system like Twitter from scratch is like building a house from the ground up, you gotta have a plan, and you gotta make sure it's solid. We gotta make sure the house stays standing, even if a storm comes through, by having 5 nines of availability, We gotta make sure the house can fit all the people who wanna come through by being able to handle 100 million users, by having a big front door, that's like a load balancer, a lot of rooms, that's like having a lot of servers, a way to keep track of everyone's stuff, that's like having a database, and a way to keep the place clean, that's like having monitoring and logging.

### **1. Introduction: Architecting a Digital Mansion (10 minutes)**

- **Digital Blueprint**: Like a house blueprint, always start with a clear plan.
- **Weathering the Storm**: Ensure 5 nines of availability.
- **Guest-Ready**: Anticipate a flux of visitors, like Twitter's 100 million users.

---

### **2. The Grand Entrance: Load Balancer (15 minutes)**

- **Big Doors, Big Traffic**: Understand the importance of using HAProxy or Nginx.
- **Directing Traffic**: Guide your digital guests to the right server rooms.

---

- Load Balancer: We would use a load balancer like HAProxy or Nginx to handle the high traffic and distribute the load among multiple servers. This would ensure that the site stays up and running even if one server goes down.

### **3. The Rooms: Servers (15 minutes)**

- **Choosing the Right Room**: Learn why Linux or Unix might be your choice.
- **Hotel Management Systems**: Introduction to Kubernetes and Docker for server orchestration.


- Servers: We would use a cluster of servers, running something like Linux or Unix, that would handle the processing of user requests and store the tweets. We can use technologies like Kubernetes or Docker to manage our servers and make sure they are running smoothly.

---

### **4. The Vault: Databases (15 minutes)**

- **Storing Precious Memories**: How databases like MySQL or Cassandra protect our digital treasures.
- **Sharding**: A technique more magical than it sounds! Distribute data across multiple servers.


- Database: We would use a database like MySQL or Cassandra to store the tweets and user information. We would use a technique like sharding to distribute the data across multiple servers, so that the database can handle the high volume of requests.

---

### **5. The Security System: Monitoring and Logging (10 minutes)**

- **Keeping an Eye on the Mansion**: Utilize tools like Prometheus, Grafana, and ELK Stack.
- **Detecting Intruders & Faults**: Importance of monitoring server health and spotting errors.
  - Monitoring and Logging: We would use tools like Prometheus, Grafana, and ELK Stack to monitor the performance of the servers and the database, and to keep track of any errors or issues that arise.


---

### **6. The Property: Cloud Infrastructure (10 minutes)**

- **Expanding Lands**: Use Amazon Web Services, Google Cloud Platform, or Microsoft Azure to "purchase more land" for your mansion.
- **Cloud Perks**: Highlighting the benefits of storage, backup, and scalability.

- Cloud Infrastructure: We would use cloud infrastructure providers like Amazon Web Services, Google Cloud Platform, or Microsoft Azure to host our servers, databases, and load balancers, as well as to provide additional services like storage and data backup.


---

### **7. The Mail Delivery: Content Delivery Network (5 minutes)**

- **Fast Letters to Every Corner**: Learn why CDN's like Akamai and Cloudflare make user experience a breeze.

- Content Delivery Network: To ensure fast loading times for users all around the world, we would use a Content Delivery Network (CDN) like Akamai, Cloudflare, or Amazon Cloudfront.

  
---

### **8. The Protective Moat: Security (5 minutes)**

- **Guarding the Fortress**: Discuss encryption, firewalls, and access controls.
- **Why Security is Non-Negotiable**: A brief intro to the risks of the digital world.

- Security: We would implement security measures like encryption, firewalls, and access control to protect the site and user data from potential threats.



## Keeping that in mind you can use that framework to explain how to build anything

## Myspace

To build a system like MySpace from scratch, the basic architecture would be similar to that of building a system like Twitter, we would use a variety of different technologies such as Load balancer, Servers, Database, Monitoring and Logging, Cloud Infrastructure, Content Delivery Network and Security measures to ensure the site is fast, secure and can handle the high volume of requests and data.

However, there would be some key differences in the way we would build MySpace vs Twitter.

- MySpace was heavily focused on personalization and customization of profile pages, which would require more complex front-end design and development. This would require a different approach in terms of front-end technologies and tools to support user-generated content and personalization features.
- MySpace also had a more complex social networking feature, which would require more advanced back-end logic and data modeling to support features like friend connections, messaging and groups.
- MySpace also had a music feature which would require additional storage and bandwidth to handle large audio files and streaming capabilities.
- In terms of scalability, MySpace's user base grew rapidly in a short period of time, so it would require more advanced techniques to handle the sudden increase in traffic and data, such as horizontal scaling and distributed systems.

In summary, while the basic architecture of building a system like MySpace and Twitter would be similar, the key differences would lie in the front-end design and development, back-end logic and data modeling, music feature, and scalability. To build a system like MySpace, it would require more advanced technologies and techniques to handle the complex features and sudden increase in traffic and data.


## Facebook Messenger


If we were designing Facebook Messenger, there would be several key differences compared to building a system like Twitter or MySpace. These include:

- Real-time messaging: One of the key features of Facebook Messenger is the ability to send and receive messages in real-time, which would require a different set of technologies and design patterns to handle the high-frequency, low-latency traffic.
- Push notifications: Another important feature of Facebook Messenger is the ability to send push notifications to users when they receive new messages, which would require a different set of technologies and protocols to handle the real-time delivery of notifications.
- Chatbot integration: Facebook Messenger has a large ecosystem of chatbots and businesses, which would require more advanced back-end logic to handle the interactions between users and chatbots.
- Rich media: Facebook Messenger supports sending and receiving different types of media such as photos, videos, GIFs, and files, which would require more storage and bandwidth.
- Multi-Platform support: Facebook messenger is available on multiple platforms, including iOS, Android, Web, and Desktop, so it would require a more advanced approach in terms of cross-platform development and compatibility.
- Security: As Facebook messenger is handling private conversations, security would be a top priority, and we would implement end-to-end encryption, access control, and other security measures to protect user data.

In summary, while the basic architecture of building a system like Facebook messenger would be similar to building a system like Twitter or MySpace, the key differences would lie in the real-time messaging, push notifications, chatbot integration, rich media, multi-platform support, and security. To design Facebook messenger it would require advanced technologies and techniques to handle the real-time, high-frequency, low-latency traffic and the different type of media.


## Instagram

Designing a system like Instagram would have similarities as well as some differences compared to building a system like Twitter, MySpace or Facebook Messenger. These include:

- High-performance image and video handling: Instagram is primarily focused on visual content, so it would require a different set of technologies and design patterns to handle the high-performance storage, retrieval, and processing of images and videos. This would include things like image and video compression, thumbnail generation, and image processing techniques like image recognition, and machine learning.
- User-generated content: Instagram is built around user-generated content, which would require a more advanced approach to handling and moderating the large amount of data being uploaded. This would include things like content moderation, image recognition, and machine learning.
- Social networking: Similar to MySpace, Instagram also has social networking features such as following, commenting, and direct messaging.
- Mobile-first approach: Instagram is a mobile-first application and has a very large user base on mobile platforms, so it would require a more advanced approach in terms of mobile development and optimization, such as responsive design and offline support.
- Story feature: Instagram has a story feature, which is a temporary and more casual way of sharing content. This would require additional development work to handle the different type of content and the expiration of the story feature.
- Personalization: Instagram has a personalized feed which shows content tailored to the user's preference and history, this would require more advanced back-end logic and data modeling.

In summary, while the basic architecture of building a system like Instagram would be similar to building a system like Twitter, MySpace, or Facebook Messenger, the key differences would lie in the high-performance image and video handling, user-generated content, mobile-first approach, story feature, personalization and social networking. To design Instagram it would require advanced technologies and techniques to handle the high-performance image and video handling and personalization features, as well as a mobile-first approach.


## Discord

Designing a system like Discord would have similarities as well as some differences compared to building a system like Twitter, MySpace, Facebook Messenger or Instagram. These include:

- Real-time voice and text messaging: Discord is a voice and text chat platform that's built for communities and gaming. It would require a different set of technologies and design patterns to handle the high-frequency, low-latency traffic for real-time voice and text messaging.
- Server-based architecture: Discord is built around the concept of servers, where users can join different servers and communicate with other users within that server. This would require a different approach in terms of data modeling and management, as well as access control and security.
- Push notifications: Discord has push notifications for when users receive new messages, and also has the feature of server-wide notifications.
- Rich media: Discord supports sending and receiving different types of media such as images, videos, GIFs, and files, which would require more storage and bandwidth.
- Multi-Platform support: Discord is available on multiple platforms, including iOS, Android, Web, and Desktop, so it would require a more advanced approach in terms of cross-platform development and compatibility.
- Gaming-specific features: Discord has a variety of features that are specific to gaming, such as the ability to join and create game-specific channels, and the ability to stream gameplay.
- Security: As Discord is handling private conversations, security would be a top priority, and we would implement end-to-end encryption, access control, and other security measures to protect user data.

In summary, while the basic architecture of building a system like Discord would be similar to building a system like Twitter, MySpace, Facebook Messenger or Instagram, the key differences would lie in the real-time voice and text messaging, server-based architecture, push notifications, rich media, multi-platform support, gaming-specific features and security. To design Discord it would require advanced technologies and techniques to handle the real-time, high-frequency, low-latency traffic, server-based architecture and gaming-specific features.



### Use this as a tool

*And that's a wrap for today's masterclass!* 