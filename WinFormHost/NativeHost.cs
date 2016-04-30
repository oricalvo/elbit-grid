using CefSharp;
using CefSharp.Internals;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

namespace WinFormHost
{
    public class NativeHost
    {
        private IJavascriptCallback action;
        //private Timer timer;
        private int ver = 1;
        private Random rand = new Random();
        private int rows = 10000;
        private double mergeSize = 0.2;
        private int extraColumns = 8;

        public NativeHost()
        {
            //this.timer = new Timer(1000);
            //this.timer.Elapsed += Timer_Elapsed;
            //this.timer.Start();
        }

        //private void Timer_Elapsed(object sender, ElapsedEventArgs e)
        //{
        //    string json = GetChanges();

        //    IJavascriptCallback action = this.action;
        //    if (action != null)
        //    {
        //        this.action.ExecuteAsync(json);
        //    }
        //}

        public void Register(IJavascriptCallback action)
        {
            this.action = action;
        }

        public string GetInitial(int rows, double mergeSize, int extraColumns)
        {
            List<JObject> contacts = new List<JObject>();

            this.rows = rows;
            this.mergeSize = mergeSize;
            this.extraColumns = extraColumns;

            for (var i = 0; i < rows; i++)
            {
                var id = i + 1;

                JObject contact = new JObject(
                    new JProperty("id", id),
                    new JProperty("firstName", "FN" + id),
                    new JProperty("lastName", "LN" + id),
                    new JProperty("email", "EM" + id),
                    new JProperty("birthday", DateTime.Now),
                    new JProperty("isAdmin", false),
                    new JProperty("role", 1)
                );

                for (var j = 0; j < extraColumns; j++)
                {
                    contact["ex" + (j + 1)] = "ex" + (j + 1) + "_" + id;
                }

                contacts.Add(contact);
            }

            string json = JsonConvert.SerializeObject(contacts);
            return json;
        }

        public string GetChanges()
        {
            var ids = GetRandomIds();
            List<JObject> contacts = new List<JObject>();

            var suffix = " (" + (ver++) + ")";
            for (var i = 0; i < ids.Length; i++)
            {
                var id = ids[i];

                JObject contact = new JObject(
                    new JProperty("id", id),
                    new JProperty("firstName", "FN" + id + suffix),
                    new JProperty("lastName", "LN" + id + suffix),
                    new JProperty("email", "EM" + id + suffix),
                    new JProperty("birthday", DateTime.Now),
                    new JProperty("isAdmin", false),
                    new JProperty("role", 1)
                );

                for (var j = 0; j < this.extraColumns; j++)
                {
                    contact["ex" + (j + 1)] = "ex" + (j + 1) + "_" + id + suffix;
                }

                contacts.Add(contact);
            }

            string json = JsonConvert.SerializeObject(contacts);
            return json;
        }

        private int[] GetRandomIds()
        {
            List<int> arr = new List<int>();
            List<int> ids = new List<int>();

            for (var i = 1; i <= this.rows; i++) {
                arr.Add(i);
            }

            for (var i = 0; i < this.mergeSize * this.rows; i++) {
                var index = (int)Math.Floor(rand.NextDouble() * 10000) % (this.rows - i);
                var id = arr[index];
                ids.Add(id);

                arr[index] = arr[arr.Count - 1];
                arr.RemoveAt(arr.Count - 1);
            }

            return ids.ToArray();
        }
    }
}
