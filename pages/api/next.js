export default function handler(req, res) {
  console.log("API ROUTE");
  const lastName = req.body.lastName;

  res.status(200).json({ result: `Your last name ${lastName} is awesome!` });
}
